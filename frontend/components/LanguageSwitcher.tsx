'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from 'lucide-react'
import { i18n, type Locale } from '@/i18n-config'

export default function LanguageSwitcher() {
  const pathName = usePathname()
  const router = useRouter()

  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  const getCurrentLanguageName = () => {
    const langCode = pathName.split('/')[1] as Locale;
    const langMap: { [key in Locale]: string } = {
        en: 'English',
        es: 'Español',
        hi: 'हिन्दी',
        pt: 'Português',
        zh: '中文',
        fr: 'Français',
        ar: 'العربية',
        de: 'Deutsch',
        ru: 'Русский',
        ur: 'اردو',
    }
    return langMap[langCode] || 'Language';
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
            <Globe className="mr-2 h-4 w-4" />
            {getCurrentLanguageName()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-background border">
        {i18n.locales.map(locale => {
            const langName = (
                {
                    en: 'English', es: 'Español', hi: 'हिन्दी', pt: 'Português', zh: '中文', 
                    fr: 'Français', ar: 'العربية', de: 'Deutsch', ru: 'Русский', ur: 'اردو'
                }[locale]
            );
          return (
            <DropdownMenuItem key={locale} onClick={() => router.push(redirectedPathName(locale))}>
              {langName}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}