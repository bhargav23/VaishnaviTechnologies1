import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from './AuthContextObject.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

async function loadProfile(userId) {
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }
  return data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [profileError, setProfileError] = useState('')
  const profileUserId = useRef(null)
  const profileRequestId = useRef(0)

  const refreshProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      profileUserId.current = null
      setProfile(null)
      setProfileError('')
      return null
    }

    const requestId = ++profileRequestId.current
    profileUserId.current = currentUser.id
    setProfileError('')
    setLoading(true)

    try {
      const profileData = await loadProfile(currentUser.id)
      if (requestId !== profileRequestId.current) {
        return null
      }
      if (!profileData) {
        throw new Error('No profile is associated with this account.')
      }
      setProfile(profileData)
      return profileData
    } catch (error) {
      if (requestId === profileRequestId.current) {
        setProfile(null)
        setProfileError(error.message)
      }
      return null
    } finally {
      if (requestId === profileRequestId.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }

    let alive = true
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (!currentUser) {
          profileRequestId.current += 1
          profileUserId.current = null
          setProfile(null)
          setProfileError('')
          setLoading(false)
          return
        }

        if (profileUserId.current === currentUser.id) {
          return
        }

        profileUserId.current = currentUser.id
        setProfile(null)
        setProfileError('')
        setLoading(true)

        window.setTimeout(() => {
          if (alive && profileUserId.current === currentUser.id) {
            void refreshProfile(currentUser)
          }
        }, 0)
      },
    )

    return () => {
      alive = false
      profileRequestId.current += 1
      authListener.subscription.unsubscribe()
    }
  }, [refreshProfile])

  const signUp = async ({ fullName, degree, email, password }) => {
    if (!supabase) {
      throw new Error('Supabase configuration is missing.')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          degree,
        },
      },
    })

    if (error) {
      throw error
    }

    return {
      requiresEmailConfirmation: !data.session,
      user: data.user,
    }
  }

  const signIn = async ({ email, password }) => {
    if (!supabase) {
      throw new Error('Supabase configuration is missing.')
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    if (!supabase) {
      setUser(null)
      setProfile(null)
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  const value = useMemo(
    () => ({
      loading,
      user,
      profile,
      profileError,
      isAdmin: profile?.role === 'admin',
      refreshProfile,
      signUp,
      signIn,
      signOut,
    }),
    [loading, user, profile, profileError, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
