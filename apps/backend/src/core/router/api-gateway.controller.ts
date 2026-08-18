import { Controller, Get } from '@nestjs/common';

/** API Gateway kök uçları: sağlık + rota haritası. */
@Controller()
export class ApiGatewayController {
  @Get('health')
  health() {
    const dbConfigured = Boolean(process.env.DATABASE_URL);
    const redisConfigured = Boolean(process.env.REDIS_URL);
    return {
      status: 'ok',
      service: 'likya-super-app-backend',
      version: '1.0.0',
      time: new Date().toISOString(),
      integrations: {
        database: dbConfigured ? 'configured' : 'standby',
        redis: redisConfigured ? 'configured' : 'standby',
      },
      modules: ['auth', 'trail', 'booking', 'marketplace', 'wallet'],
    };
  }

  @Get('routes')
  routes() {
    return {
      gateway: 'v1',
      routes: [
        { method: 'POST', path: '/v1/auth/register', roles: ['public'] },
        { method: 'POST', path: '/v1/auth/login', roles: ['public'] },
        { method: 'POST', path: '/v1/auth/refresh', roles: ['public'] },
        { method: 'GET', path: '/v1/auth/me', roles: ['tourist+'] },
        { method: 'GET', path: '/v1/trail/pois/nearby?lat&lng&radius', roles: ['tourist+'] },
        { method: 'POST', path: '/v1/trail/gpx', roles: ['tourist+'] },
        { method: 'GET', path: '/v1/trail/tracks/:id', roles: ['tourist+'] },
        { method: 'POST', path: '/v1/trail/sos', roles: ['tourist+'] },
        { method: 'GET', path: '/v1/booking/available?type&date', roles: ['tourist+'] },
        { method: 'POST', path: '/v1/booking', roles: ['tourist+'] },
        { method: 'GET', path: '/v1/marketplace/products', roles: ['public'] },
        { method: 'POST', path: '/v1/marketplace/orders', roles: ['tourist+'] },
        { method: 'GET', path: '/v1/wallet/balance', roles: ['tourist+'] },
        { method: 'POST', path: '/v1/wallet/pay', roles: ['tourist+'] },
        { method: 'POST', path: '/v1/wallet/coupons/redeem', roles: ['tourist+'] },
      ],
    };
  }
}

