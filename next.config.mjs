import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntlPlugin = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

export default withNextIntlPlugin(nextConfig);