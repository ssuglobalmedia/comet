# lambda-svelte-skeleton

Full-stack example using AWS SAM, DynamoDB for backend, Svelte, AWS S3 for frontend.
Used AWS CloudFront and API Gateway to combine all services.

# How to run

```yaml
Prerequisites: aws-sam-cli, aws-cli, docker, node, pnpm
```

1. Run `pnpm i` in the root directory.
2. Run `pnpm dev` for testing.(No hot-reload for backend because of limitation of `sam local start-api`, You need to
   execute `pnpm build` in advance.)
3. Run `pnpm build` for production-ready build. (file generated to `packages/server/.aws-sam/build` for
   backend, `packages/client/.svelte-kit/build` for frontend)
4. Run `pnpm deploy` for deploy project to aws.
5. Run `pnpm delete` for delete service stack from AWS.