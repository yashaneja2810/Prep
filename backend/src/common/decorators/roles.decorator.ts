import { SetMetadata } from '@nestjs/common';
import { USER_ROLES, AUTH_METADATA } from '../helpers/string-const';

export const Roles = (...roles: USER_ROLES[]) => SetMetadata(AUTH_METADATA.ROLES, roles); 