'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import logo from '@/assets/images/logo-header.png'
import chevron from '@/assets/icons/icon-chevron-down.svg'
import { assetSrc } from '@/lib/utils/assetSrc'
import { alternateLocale } from '@/lib/i18n/locale'
import { switchLocalePath, withLocale } from '@/lib/i18n/paths'

const desktopLinkClass =
  'relative inline-flex min-h-8 items-center gap-1.5 border-0 bg-transparent px-0 py-1 font-jakarta text-[15px] leading-6 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-teal'

function desktopNavClass(active) {
  return active
    ? `${desktopLinkClass} font-bold text-teal-deep after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-[#BAA87A] after:content-['']`
    : `${desktopLinkClass} font-normal text-ink`
}

const mobileLinkClass =
  'flex w-full items-center justify-between border-0 border-b border-line/70 bg-transparent px-0 py-4 text-start font-jakarta text-base leading-6 text-ink focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-teal'

function mobileNavClass(active) {
  return active ? `${mobileLinkClass} font-bold text-teal-deep` : `${mobileLinkClass} font-normal`
}

function isActivePath(pathname, href) {
  if (!pathname || !href) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

function Header({ locale = 'en', messages, services = [] }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const homeHref = withLocale('/', locale)
  const aboutHref = withLocale('/about', locale)
  const servicesHref = withLocale('/services', locale)
  const contactHref = withLocale('/contact', locale)
  const homeActive = pathname === homeHref || (locale === 'en' && pathname === '/')
  const aboutActive = isActivePath(pathname, aboutHref)
  const servicesActive = isActivePath(pathname, servicesHref)
  const contactActive = isActivePath(pathname, contactHref)
  const nav = messages?.nav || {}
  const englishActive = locale === 'en'
  const isArabic = locale === 'ar'
  const nextLocale = alternateLocale(locale)
  const languageHref = switchLocalePath(pathname || '/', nextLocale)

  const serviceItems = services
    .filter((service) => service?.slug && service?.name)
    .map((service) => ({
      href: withLocale(`/services/${service.slug}`, locale),
      label: service.name,
    }))

  function closeMenu() {
    setMenuOpen(false)
    setServicesOpen(false)
  }

  useEffect(() => {
    if (!menuOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
    setServicesOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 h-20 w-full border-b border-line/60 bg-white shadow-[0_4px_16px_rgba(15,28,38,0.04)]">
      <div className="relative mx-auto grid h-full w-full max-w-[1440px] grid-cols-[250px_1fr_auto] items-center gap-6 pr-20 pl-[114px] max-[1439px]:px-8 max-[1200px]:grid-cols-[180px_1fr_auto] max-[1200px]:px-6 max-[1023px]:grid-cols-[auto_1fr_auto] max-[1023px]:px-6 max-[767px]:px-4">
        <Link href={homeHref} className="col-start-1 block" onClick={closeMenu}>
          <img
            src={assetSrc(logo)}
            alt="Awwad Alzboon Legal Consultancy"
            width="250"
            height="50"
            className="h-[50px] w-[250px] object-contain max-[1200px]:h-9 max-[1200px]:w-[180px] max-[767px]:h-[30px] max-[767px]:w-[148px]"
          />
        </Link>

        <button
          type="button"
          className="col-start-2 hidden h-10 w-10 items-center justify-center justify-self-end rounded border border-line bg-white focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-teal max-[1023px]:inline-flex"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="flex w-[18px] flex-col gap-[4.5px]" aria-hidden="true">
            <span className={`h-[1.5px] origin-center bg-ink transition-transform duration-300 ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`h-[1.5px] bg-ink transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`h-[1.5px] origin-center bg-ink transition-transform duration-300 ${menuOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </span>
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
        </button>

        {/* Desktop navigation */}
        <nav
          className="col-start-2 flex items-center justify-center gap-20 max-[1439px]:gap-9 max-[1200px]:gap-7 max-[1023px]:hidden"
          aria-label="Primary"
        >
          <Link href={homeHref} className={desktopNavClass(homeActive)} aria-current={homeActive ? 'page' : undefined}>
            {nav.home || 'Home'}
          </Link>
          <Link href={aboutHref} className={desktopNavClass(aboutActive)} aria-current={aboutActive ? 'page' : undefined}>
            {nav.about || 'About Us'}
          </Link>

          <div className="group relative">
            <button
              type="button"
              className={desktopNavClass(servicesActive)}
              aria-expanded={servicesOpen}
              aria-controls="desktop-services-menu"
              aria-current={servicesActive ? 'page' : undefined}
              onClick={() => setServicesOpen((open) => !open)}
            >
              {nav.services || 'Services'}
              <img src={assetSrc(chevron)} alt="" width="8" height="5" className="h-[5px] w-2" />
            </button>
            <div
              id="desktop-services-menu"
              role="group"
              aria-label={nav.services || 'Services'}
              className={`${servicesOpen ? 'flex' : 'hidden'} absolute top-full left-1/2 z-30 min-w-[220px] -translate-x-1/2 flex-col pt-2.5 group-hover:flex group-focus-within:flex`}
            >
              <div className="flex flex-col rounded-lg border border-line bg-white py-1 shadow-header">
                {serviceItems.map((service, index) => (
                  <Link
                    key={service.href}
                    href={service.href}
                    className={`block px-3 py-2.5 font-jakarta text-sm leading-5 text-ink hover:bg-cream hover:text-teal-deep ${index > 0 ? 'border-t border-line/70' : ''}`}
                  >
                    {service.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href={contactHref}
            className={desktopNavClass(contactActive)}
            aria-current={contactActive ? 'page' : undefined}
          >
            {nav.contact || 'Contact Us'}
          </Link>
        </nav>

        <Link
          href={languageHref}
          className="col-start-3 inline-flex h-9 min-w-[92px] items-center gap-1 rounded-[2px] border border-line bg-white px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-teal max-[1023px]:hidden"
          aria-label={messages?.home?.languageLabel || 'Switch language'}
          hrefLang={nextLocale}
        >
          <span className={`font-freeserif text-sm leading-5 font-bold tracking-[0.7px] ${englishActive ? 'font-normal text-muted' : 'text-ink'}`}>
            العربية
          </span>
          <span
            className={`font-jakarta leading-5 font-semibold tracking-[0.7px] ${englishActive ? 'text-xs font-bold text-ink' : 'text-[10px] text-muted'}`}
          >
            / EN
          </span>
        </Link>
      </div>

      {/* Mobile side drawer */}
      <div className="min-[1024px]:hidden" aria-hidden={!menuOpen}>
        <button
          type="button"
          tabIndex={menuOpen ? 0 : -1}
          aria-label="Close menu"
          className={`fixed inset-0 z-40 bg-ink/35 transition-opacity duration-300 ${
            menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={closeMenu}
        />
        <nav
          id="mobile-navigation"
          className={`fixed top-0 z-50 flex h-dvh w-[min(100%,20.5rem)] flex-col bg-white shadow-[0_20px_50px_rgba(1,19,32,0.18)] transition-transform duration-300 ease-out ${
            isArabic ? 'left-0' : 'right-0'
          } ${menuOpen ? 'translate-x-0' : isArabic ? '-translate-x-full' : 'translate-x-full'}`}
          aria-label="Mobile"
        >
          <div className="flex h-20 items-center justify-between border-b border-line/60 px-5">
            <p className="font-jakarta text-sm font-semibold tracking-[0.08em] text-teal uppercase">
              {isArabic ? 'القائمة' : 'Menu'}
            </p>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded border border-line"
              onClick={closeMenu}
            >
              <span className="sr-only">Close menu</span>
              <span aria-hidden="true" className="font-jakarta text-xl leading-none text-ink">
                ×
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-8">
            <Link href={homeHref} className={mobileNavClass(homeActive)} aria-current={homeActive ? 'page' : undefined} onClick={closeMenu}>
              {nav.home || 'Home'}
            </Link>
            <Link href={aboutHref} className={mobileNavClass(aboutActive)} aria-current={aboutActive ? 'page' : undefined} onClick={closeMenu}>
              {nav.about || 'About Us'}
            </Link>

            <div>
              <button
                type="button"
                className={mobileNavClass(servicesActive)}
                aria-expanded={servicesOpen}
                aria-controls="mobile-services-menu"
                onClick={() => setServicesOpen((open) => !open)}
              >
                <span>{nav.services || 'Services'}</span>
                <img
                  src={assetSrc(chevron)}
                  alt=""
                  width="10"
                  height="6"
                  className={`h-1.5 w-2.5 transition-transform duration-300 ${servicesOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                id="mobile-services-menu"
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  servicesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-b border-line/70 pb-2">
                    {serviceItems.map((service) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        className="block py-2.5 ps-4 font-jakarta text-[15px] leading-6 text-body transition-colors hover:text-teal-deep"
                        onClick={closeMenu}
                      >
                        {service.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link
              href={contactHref}
              className={mobileNavClass(contactActive)}
              aria-current={contactActive ? 'page' : undefined}
              onClick={closeMenu}
            >
              {nav.contact || 'Contact Us'}
            </Link>
          </div>

          <div className="mt-auto border-t border-line/60 px-5 py-5">
            <Link
              href={languageHref}
              className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-[2px] border border-line bg-white px-3 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-teal"
              aria-label={messages?.home?.languageLabel || 'Switch language'}
              hrefLang={nextLocale}
              onClick={closeMenu}
            >
              <span className={`font-freeserif text-sm leading-5 font-bold tracking-[0.7px] ${englishActive ? 'font-normal text-muted' : 'text-ink'}`}>
                العربية
              </span>
              <span
                className={`font-jakarta leading-5 font-semibold tracking-[0.7px] ${englishActive ? 'text-xs font-bold text-ink' : 'text-[10px] text-muted'}`}
              >
                / EN
              </span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
