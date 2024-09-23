import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();
/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'dau.stu.id.vn',
                port: '81',
                pathname: '/**'
            },
            {
                hostname: 'localhost',
                pathname: '/**'
            },
        ],
    }
};

export default withNextIntl(nextConfig);