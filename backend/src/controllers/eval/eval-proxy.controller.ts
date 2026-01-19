import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { fetch as undiciFetch } from 'undici';
import { LocalAuthGuard, RoleGuard } from 'src/domain/auth';
import { Role } from 'src/domain/auth/role.decorator';
import { BUILTIN_USER_GROUP_ADMIN } from 'src/domain/database';

/**
 * Dynamic proxy controller for eval service.
 *
 * This controller acts as an authenticated proxy to the internal eval service.
 * All routes are protected with LocalAuthGuard (session auth) and RoleGuard (admin only).
 *
 * Guards execute BEFORE the controller method, ensuring req.user is populated.
 * The controller method then forwards authenticated requests to the eval service.
 */
@Controller('eval')
@UseGuards(LocalAuthGuard, RoleGuard)
@Role(BUILTIN_USER_GROUP_ADMIN)
@ApiTags('eval')
export class EvalProxyController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Proxy all requests to eval service.
   *
   * This wildcard route matches all HTTP methods and paths under /eval/*.
   * Guards execute first to validate authentication and admin role.
   * Then this method forwards the request to the eval service.
   *
   * Access: Admin users only
   */
  @All('*')
  @ApiOperation({
    summary: 'Proxy requests to eval service',
    description: 'All eval service endpoints are proxied through this controller with authentication',
  })
  async proxy(@Req() req: Request, @Res() res: Response) {
    const evalServiceUrl = this.configService.get<string>('EVAL_SERVICE_URL', 'http://localhost:3202');

    // Remove /api/eval prefix from path for forwarding
    const targetPath = req.path.replace(/^\/api\/eval/, '');

    // Build query string
    const queryString =
      Object.keys(req.query).length > 0 ? '?' + new URLSearchParams(req.query as Record<string, string>).toString() : '';

    const targetUrl = `${evalServiceUrl}${targetPath}${queryString}`;

    // Log request (similar to previous middleware logging)
    console.log('=== Eval Proxy: Incoming Request ===');
    console.log(`Method: ${req.method}`);
    console.log(`Path: ${req.path}`);
    console.log(`Target: ${targetUrl}`);
    console.log(`User: ${req.user.name} (${req.user.id})`);
    if (req.body) {
      console.log(`Body:`, JSON.stringify(req.body, null, 2));
    }
    console.log('===================================');

    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'X-User-Id': req.user.id,
        'X-User-Name': req.user.name,
      };

      if (req.user.email) {
        headers['X-User-Email'] = req.user.email;
      }

      if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'];
      }

      // Prepare request body
      let body: string | undefined;
      if (!['GET', 'HEAD'].includes(req.method)) {
        if (req.body) {
          // Body is already parsed by body-parser middleware
          body = JSON.stringify(req.body);
          // Ensure content-type is set for JSON
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
          }
        }
      }

      // Forward request to eval service
      const response = await undiciFetch(targetUrl, {
        method: req.method,
        headers,
        body,
      });

      // Get response body
      const buffer = await response.arrayBuffer();
      const responseBody = Buffer.from(buffer);

      // Log response
      console.log('=== Eval Proxy: Response ===');
      console.log(`Status: ${response.status} ${response.statusText}`);

      // Log response body for debugging (especially for errors)
      if (response.status >= 400) {
        try {
          const bodyText = responseBody.toString('utf-8');
          console.log(`Error Response Body:`, bodyText);
        } catch (e) {
          console.log(`Could not parse error response body`);
          console.log(e);
        }
      }
      console.log('============================');

      // Forward response headers
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      // Forward status and body
      res.status(response.status);
      res.send(responseBody);
    } catch (error) {
      console.error('=== Eval Proxy: ERROR ===');
      console.error(`Error:`, error instanceof Error ? error.message : String(error));
      console.error('=========================');

      if (!res.headersSent) {
        res.status(502).json({
          error: 'Bad Gateway',
          message: 'Eval service is unavailable',
        });
      }
    }
  }
}
