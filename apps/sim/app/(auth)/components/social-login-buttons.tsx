'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { Button } from '@/components/emcn'
import { GithubIcon, GoogleIcon } from '@/components/icons'
import { client } from '@/lib/auth/auth-client'

interface SocialLoginButtonsProps {
  githubAvailable: boolean
  googleAvailable: boolean
  nextcloudAvailable: boolean
  callbackURL?: string
  isProduction: boolean
  children?: ReactNode
}

export function SocialLoginButtons({
  githubAvailable,
  googleAvailable,
  nextcloudAvailable,
  callbackURL = '/workspace',
  isProduction,
  children,
}: SocialLoginButtonsProps) {
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isNextcloudLoading, setIsNextcloudLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Set mounted state to true on client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Only render on the client side to avoid hydration errors
  if (!mounted) return null

  async function signInWithGithub() {
    if (!githubAvailable) return

    setIsGithubLoading(true)
    try {
      await client.signIn.social({ provider: 'github', callbackURL })
    } catch (err: any) {
      let errorMessage = 'Failed to sign in with GitHub'

      if (err.message?.includes('account exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (err.message?.includes('cancelled')) {
        errorMessage = 'GitHub sign in was cancelled. Please try again.'
      } else if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (err.message?.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please try again later.'
      }
    } finally {
      setIsGithubLoading(false)
    }
  }

  async function signInWithGoogle() {
    if (!googleAvailable) return

    setIsGoogleLoading(true)
    try {
      await client.signIn.social({ provider: 'google', callbackURL })
    } catch (err: any) {
      let errorMessage = 'Failed to sign in with Google'

      if (err.message?.includes('account exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (err.message?.includes('cancelled')) {
        errorMessage = 'Google sign in was cancelled. Please try again.'
      } else if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (err.message?.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please try again later.'
      }
    } finally {
      setIsGoogleLoading(false)
    }
  }

  async function signInWithNextcloud() {
    if (!nextcloudAvailable) return

    // If we're inside an iframe (e.g. Nextcloud external site), break out to the
    // top-level window first. OAuth flows require top-level navigation because
    // Nextcloud's CSRF tokens and session cookies are blocked in third-party
    // iframe contexts, causing "State token does not match" errors.
    try {
      if (window.self !== window.top) {
        const loginUrl = new URL(window.location.href)
        loginUrl.searchParams.set('startOAuth', 'nextcloud')
        window.top!.location.href = loginUrl.toString()
        return
      }
    } catch {
      // Cross-origin iframe — open in new tab as fallback
      const loginUrl = new URL(window.location.href)
      loginUrl.searchParams.set('startOAuth', 'nextcloud')
      window.open(loginUrl.toString(), '_blank')
      return
    }

    setIsNextcloudLoading(true)
    try {
      await client.signIn.oauth2({ providerId: 'nextcloud', callbackURL })
    } catch (err: any) {
      let errorMessage = 'Failed to sign in with Nextcloud'

      if (err.message?.includes('account exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (err.message?.includes('cancelled')) {
        errorMessage = 'Nextcloud sign in was cancelled. Please try again.'
      } else if (err.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (err.message?.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please try again later.'
      }
    } finally {
      setIsNextcloudLoading(false)
    }
  }

  const githubButton = (
    <Button
      variant='outline'
      className='w-full rounded-[10px]'
      disabled={!githubAvailable || isGithubLoading}
      onClick={signInWithGithub}
    >
      <GithubIcon className='!h-[18px] !w-[18px] mr-1' />
      {isGithubLoading ? 'Connecting...' : 'GitHub'}
    </Button>
  )

  const googleButton = (
    <Button
      variant='outline'
      className='w-full rounded-[10px]'
      disabled={!googleAvailable || isGoogleLoading}
      onClick={signInWithGoogle}
    >
      <GoogleIcon className='!h-[18px] !w-[18px] mr-1' />
      {isGoogleLoading ? 'Connecting...' : 'Google'}
    </Button>
  )

  const nextcloudButton = (
    <Button
      variant='outline'
      className='w-full rounded-[10px]'
      disabled={!nextcloudAvailable || isNextcloudLoading}
      onClick={signInWithNextcloud}
    >
      <svg className='!h-[18px] !w-[18px] mr-1' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M12.018 6.537c-2.5 0-4.6 1.712-5.241 4.015-.56-1.147-1.756-1.946-3.133-1.946C1.632 8.606 0 10.225 0 12.236s1.632 3.63 3.644 3.63c1.377 0 2.573-.799 3.133-1.946.641 2.303 2.741 4.015 5.241 4.015 2.5 0 4.6-1.712 5.241-4.015.56 1.147 1.756 1.946 3.133 1.946 2.012 0 3.644-1.619 3.644-3.63s-1.632-3.63-3.644-3.63c-1.377 0-2.573.799-3.133 1.946-.641-2.303-2.741-4.015-5.241-4.015zm0 2.085c1.924 0 3.482 1.564 3.482 3.614 0 2.05-1.558 3.614-3.482 3.614-1.924 0-3.482-1.564-3.482-3.614 0-2.05 1.558-3.614 3.482-3.614zm-8.374 1.93c.85 0 1.538.692 1.538 1.684 0 .991-.689 1.684-1.538 1.684-.85 0-1.538-.693-1.538-1.684 0-.992.689-1.684 1.538-1.684zm16.748 0c.85 0 1.538.692 1.538 1.684 0 .991-.689 1.684-1.538 1.684-.85 0-1.538-.693-1.538-1.684 0-.992.689-1.684 1.538-1.684z' />
      </svg>
      {isNextcloudLoading ? 'Connecting...' : 'Nextcloud'}
    </Button>
  )

  const hasAnyOAuthProvider = githubAvailable || googleAvailable || nextcloudAvailable

  if (!hasAnyOAuthProvider && !children) {
    return null
  }

  return (
    <div className='grid gap-3 font-light'>
      {nextcloudAvailable && nextcloudButton}
      {googleAvailable && googleButton}
      {githubAvailable && githubButton}
      {children}
    </div>
  )
}
