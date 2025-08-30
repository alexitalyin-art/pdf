'use client'

import Script from 'next/script'

export const Analytics = () => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;

    if (!gaId) {
        return null;
    }

    return (
        <>
            <Script
                strategy="lazyOnload"
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script id="ga-analytics" strategy="lazyOnload">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', '${gaId}');
                `}
            </Script>
        </>
    )
}