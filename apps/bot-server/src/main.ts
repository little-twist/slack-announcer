import { App } from '@slack/bolt';
import { env } from './config/env';

const app = new App({
  signingSecret: env.signingSecret,
  token: env.slackBotToken,
  appToken: env.slackAppToken,
  socketMode: true,
});
