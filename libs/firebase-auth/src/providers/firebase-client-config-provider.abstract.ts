import { Injectable } from '@nestjs/common';
import type { FirebaseClientConfig } from '../interfaces/firebase-client-config.interface';

export abstract class FirebaseClientConfigProvider {
  abstract getClientConfig(): Promise<FirebaseClientConfig>;
}
