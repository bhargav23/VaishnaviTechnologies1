import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContextObject.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

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
  const [loading, setLoading] = useState(true)

  const refreshProfile = async (currentUser, attempts = 4) => {
    if (!currentUser) {
      setProfile(null)
      return
    }

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const profileData = await loadProfile(currentUser.id)
      if (profileData) {
        setProfile(profileData)
        return profileData
      }

      if (attempt < attempts - 1) {
        await delay(200)
      }
    }

    setProfile(null)
    return null
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let alive = true
    const bootstrap = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          throw error
        }

        const currentUser = data?.user ?? null
        if (!alive) {
          return
        }

        setUser(currentUser)
        if (currentUser) {
          await refreshProfile(currentUser)
        }
      } finally {
        if (alive) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await refreshProfile(currentUser)
        } else {
          setProfile(null)
        }
      },
    )

    return () => {
      alive = false
      authListener.subscription.unsubscribe()
    }
  }, [])

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

    if (data.user && data.session) {
      await refreshProfile(data.user)
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw error
    }

    if (data.user) {
      await refreshProfile(data.user)
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
      isAdmin: profile?.role === 'admin',
      signUp,
      signIn,
      signOut,
    }),
    [loading, user, profile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
