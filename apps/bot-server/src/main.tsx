import 'dotenv/config';
import { App } from '@slack/bolt';
import { env } from './config/env';

const app = new App({
  signingSecret: env.signingSecret,
  token: env.slackBotToken,
  appToken: env.slackAppToken,
  socketMode: true,
});

app.command('/soufu', async ({ ack, client, body }) => {
  await ack();

  client.views.open({
    trigger_id: body.trigger_id,
    view: {
      callback_id: 'soufu-view',
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'メッセージを編集',
        emoji: true,
      },
      submit: {
        type: 'plain_text',
        text: 'Submit',
        emoji: true,
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
        emoji: true,
      },
      blocks: [
        {
          type: 'input',
          block_id: 'message',
          element: {
            type: 'rich_text_input',
            focus_on_load: true,
            action_id: 'rich_text_input',
          },
          label: {
            type: 'plain_text',
            text: ':speech_balloon: メッセージ',
            emoji: true,
          },
        },
        { type: 'divider' },
        {
          type: 'section',
          block_id: 'conversations',
          text: {
            type: 'mrkdwn',
            text: ':mega: *送信先*',
          },
          accessory: {
            type: 'multi_conversations_select',
            placeholder: {
              type: 'plain_text',
              text: '送信先を選択',
              emoji: true,
            },
            action_id: 'conversations_select',
          },
        },
        // todo: グループ機能
        // {
        //   type: 'actions',
        //   elements: [
        //     {
        //       type: 'static_select',
        //       placeholder: {
        //         type: 'plain_text',
        //         text: 'グループから入力する...',
        //         emoji: true,
        //       },
        //       options: [
        //         {
        //           text: {
        //             type: 'plain_text',
        //             text: '*plain_text option 0*',
        //             emoji: true,
        //           },
        //           value: 'value-0',
        //         },
        //         {
        //           text: {
        //             type: 'plain_text',
        //             text: '*plain_text option 1*',
        //             emoji: true,
        //           },
        //           value: 'value-1',
        //         },
        //         {
        //           text: {
        //             type: 'plain_text',
        //             text: '*plain_text option 2*',
        //             emoji: true,
        //           },
        //           value: 'value-2',
        //         },
        //       ],
        //       action_id: 'actionId-3',
        //     },
        //   ],
        // },
        // {
        //   type: 'context',
        //   elements: [
        //     {
        //       type: 'mrkdwn',
        //       text: ':information_desk_person: 設定からグループを登録するとよく送信する宛先を呼び出すことができます。設定方法は<https://example.com|ヘルプページ>を参照してください。',
        //     },
        //   ],
        // },
      ],
    },
  });
});

app.view('soufu-view', async ({ ack, view, client }) => {
  await ack();

  const messageElements =
    view.state.values.message.rich_text_input.rich_text_value?.elements;
  const destinations =
    view.state.values.conversations.conversations_select.selected_conversations;

  if (messageElements === undefined || destinations === undefined) {
    throw new Error('messageElements or destinations is undefined');
  }

  await Promise.all(
    destinations.map(async (destination) => {
      await client.chat.postMessage({
        channel: destination,
        text: messageElements
          .flatMap((e) =>
            e.type === 'rich_text_section'
              ? e.elements.flatMap((el) => ('text' in el ? [el.text] : []))
              : [],
          )
          .join(''),
        blocks: [{ type: 'rich_text', elements: messageElements }],
      });
    }),
  );
});

app.action('conversations_select', async ({ ack }) => {
  await ack();
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running on port 3000');
})();
