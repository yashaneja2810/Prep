import { SetMetadata } from '@nestjs/common';
import { AUTH_METADATA } from '../helpers/string-const';

export const Public = () => SetMetadata(AUTH_METADATA.IS_PUBLIC, true); 