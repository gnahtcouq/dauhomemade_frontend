import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();
/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'dau.stu.id.vn',
                port: '81',
                pathname: '/**'
            },
        ]
    }
};

export default withNextIntl(nextConfig);