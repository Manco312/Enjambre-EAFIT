import { ROUTE_NAMES } from '@/constants/routeNames';

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];
