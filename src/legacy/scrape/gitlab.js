const puppeteer = require('puppeteer');

process.on('unhandledRejection', (e) => {
  console.error(e);
  process.exit(1);
});

const main = async (maxNumOfElements) => {

  const browser = await puppeteer.launch({
    headless: false
  });

  try {
    const path = '/dashboard/merge_requests';
    let url = `${process.env.GITLAB_URL}${path}`;
    url += `?author_id=${process.env.GITLAB_AUTHOR_ID}`;
    url += `&sort=updated_desc`;
    url += `&state=opened`;

    const page = await browser.newPage();

    await loginToGitlab(page);

    await page.goto(url);

    let elements = await page.$$eval(
      '.mr-list .merge-request .issuable-pipeline-status .ci-status-link',
      elements => elements.map(x => x.classList.contains('ci-status-icon-success'))
    );

    if (elements.length > maxNumOfElements) {
      elements = elements.slice(0, maxNumOfElements);
    }

    await browser.close();

    return elements;
  } catch (e) {
    await browser.close();
    throw e;
  }
};

const loginToGitlab = async (page) => {
  const path = '/users/sign_in';
  const url = `${process.env.GITLAB_URL}${path}`;

  await page.goto(url);

  if (!page.url().includes(path)) {
    return;
  };

  await loginToOneLogin(page);

  await page.goto(url);

  if (!page.url().includes(path)) {
    return;
  };

  await Promise.all([
    await page.click('#oauth-login-saml'),
    page.waitForNavigation({
      timeout: 3000,
      waitUntil: ['load', 'networkidle0']
    })
  ]);

  if (page.url().includes(path)) {
    throw new Error('Could not log in to Gitlab');
  }
}

const loginToOneLogin = async (page) => {
  const path = '/login';
  const url = `${process.env.ONE_LOGIN_URL}${path}`;

  await page.goto(url);

  if (!page.url().includes(path)) {
    return;
  };

  await page.type('#user_email', process.env.ONE_LOGIN_USERNAME);
  await page.type('#user_password', process.env.ONE_LOGIN_PASSWORD);

  await Promise.all([
    await page.click('#user_submit'),
    page.waitForNavigation({
      timeout: 10 * 1000,
      waitUntil: ['load', 'networkidle0']
    })
  ]);

  if (page.url().includes(path)) {
    throw new Error('Could not log in to One Login');
  }
}

module.exports = main;
