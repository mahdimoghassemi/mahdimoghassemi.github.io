import type { NextConfig } from "next"

const repo = process.env.GITHUB_REPOSITORY?.split("/")[1]
const basePath = repo && !repo.endsWith(".github.io") ? `/${repo}` : ""

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}

export default nextConfig
