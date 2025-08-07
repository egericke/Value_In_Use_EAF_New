/** @type {import('next').NextConfig} */
const nextConfig = {
    // Optional: Rewrites can handle routing to the Python API during development
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://127.0.0.1:8000/api/:path*', // Proxy to Python backend
            },
        ]
    },
};

export default nextConfig;
