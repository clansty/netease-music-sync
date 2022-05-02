import nease from 'NeteaseCloudMusicApi';
import prompts from 'prompts';

(async () => {
  const { loginMethod } = await prompts({
    type: 'select', name: 'loginMethod', message: '选择登录方式',
    choices: [
      { title: '手机号密码', value: 'phone' },
      { title: '手机验证码', value: 'code' },
      { title: '邮箱', value: 'mail' },
    ],
  });
  let cookie: string;
  switch (loginMethod) {
    case 'phone': {
      const phonePassword = await prompts([
        { type: 'text', name: 'phone', message: '手机号' },
        { type: 'text', name: 'password', message: '密码' },
      ]);
      const result = await nease.login_cellphone(phonePassword);
      cookie = result.body.cookie;
      break;
    }
    case 'code': {
      const { phone } = await prompts([
        { type: 'text', name: 'phone', message: '手机号' },
      ]);
      await nease.captcha_sent({ cellphone: phone });
      const { captcha } = await prompts([
        { type: 'text', name: 'captcha', message: '短信验证码' },
      ]);
      const result = await nease.login_cellphone({ phone, captcha });
      cookie = result.body.cookie;
      break;
    }
    case 'mail': {
      const emailPassword = await prompts([
        { type: 'text', name: 'email', message: '网易邮箱' },
        { type: 'text', name: 'password', message: '密码' },
      ]);
      const result = await nease.login(emailPassword);
      cookie = result.body.cookie;
      break;
    }
  }
  console.log('你的 Cookie:\n' + cookie);
})();
