/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: 'localhost',
                pathname: '/**'
            },
            {
                hostname: 'via.placeholder.com',
                pathname: '/**'
            }
        ]
    }
};

export default nextConfig;
