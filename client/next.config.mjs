import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();
/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'dau.stu.id.vn',
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