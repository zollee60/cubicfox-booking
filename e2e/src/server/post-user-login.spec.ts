import axios from 'axios';

describe('POST /public/user/login', () => {
  const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'sid';
  it('should return a session cookie on successful login', async () => {
    const res = await axios.post(`/public/user/login`, {
      email: 'hello@test.hu',
      password: 'biztonsagosJelszo',
    });

    const sessionCookie = res.headers['set-cookie']?.find((c) =>
      c.includes(sessionCookieName)
    );

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(sessionCookie).toBeDefined();
  });

  it('should return 401 on - invalid email', async () => {
    try {
      await axios.post(`/public/user/login`, {
        email: 'hellox@test.hu',
        password: 'biztonsagosJelszo',
      });
    } catch (e: any) {
      expect(e.response.status).toBe(401);
      expect(e.response.data.message).toBe('User not found');
    }
  });

  it('should return 401 on - invalid password', async () => {
    try {
      await axios.post(`/public/user/login`, {
        email: 'hello@test.hu',
        password: 'iztonsagosJelszo',
      });
    } catch (e: any) {
      expect(e.response.status).toBe(401);
      expect(e.response.data.message).toBe('Invalid password');
    }
  });

  it('should return 400 on - invalid input', async () => {
    try {
      await axios.post(`/public/user/login`, {
        email: '',
      });
    } catch (e: any) {
      expect(e.response.status).toBe(400);
      expect(e.response.data.message).toBe('Invalid input');
    }
  });
});
