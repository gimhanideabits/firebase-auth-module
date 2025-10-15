import { Injectable } from '@nestjs/common';
import type { FirebaseCredentials } from '../interfaces';

export abstract class FirebaseCredentialsProvider {
  abstract getCredentials(): Promise<FirebaseCredentials>;
}
