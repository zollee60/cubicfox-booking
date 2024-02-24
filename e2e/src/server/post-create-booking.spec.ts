import axios from 'axios';

describe('POST /users/:id/bookings', () => {
  const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'sid';
  const userId = '0816592e-a179-43d5-9913-ab8dc0d6bf24';
  const room1Id = '8ad380c7-9120-431c-9ed6-a0c24817503e';
  const bookingIds: string[] = [];

  afterAll(async () => {
    for (const id of bookingIds) {
      await axios.delete(`/users/${userId}/bookings/${id}`);
    }
  });

  it('should return 401 on - unauthenticated', async () => {
    try {
      await axios.post(
        `/users/${userId}/bookings`,
        {
          userId,
          roomId: room1Id,
          checkIn: '2023-01-01',
          checkOut: '2023-01-02',
        },
        {
          headers: {
            Cookie: `${sessionCookieName}=invalid-session-cookie`,
          },
        }
      );
    } catch (e: any) {
      expect(e.response.status).toBe(401);
      expect(e.response.data.message).toBe('Unauthorized');
    }
  });

  it('should create a booking', async () => {
    const res = await axios.post(`/users/${userId}/bookings`, {
      userId,
      roomId: room1Id,
      checkIn: '2023-01-01',
      checkOut: '2023-01-02',
    });

    bookingIds.push(res.data.bookingId);

    expect(res.status).toBe(200);
    expect(res.data.bookingId).toBeDefined();
  });

  it('should return 400 on - invalid input', async () => {
    try {
      await axios.post(`/users/${userId}/bookings`, {
        roomId: 'room1',
        checkIn: '2023-01-01',
      });
    } catch (e: any) {
      expect(e.response.status).toBe(400);
      expect(e.response.data.message).toBe('Invalid input');
    }
  });

  it('should return 400 on - invalid date', async () => {
    try {
      await axios.post(`/users/${userId}/bookings`, {
        roomId: 'room1',
        checkIn: '2023-01-01',
        checkOut: '2022-01-01',
      });
    } catch (e: any) {
      expect(e.response.status).toBe(400);
      expect(e.response.data.message).toBe(
        'Check out date must be after check in date'
      );
    }
  });

  it('should return 400 on - room not found', async () => {
    try {
      await axios.post(`/users/${userId}/bookings`, {
        roomId: 'roomX',
        checkIn: '2023-01-01',
        checkOut: '2023-01-02',
      });
    } catch (e: any) {
      expect(e.response.status).toBe(400);
      expect(e.response.data.message).toBe('Room not found');
    }
  });

  it('should return 400 on - room not available', async () => {
    try {
      await axios.post(`/users/${userId}/bookings`, {
        roomId: room1Id,
        checkIn: '2023-01-01',
        checkOut: '2023-01-02',
      });
    } catch (e: any) {
      expect(e.response.status).toBe(400);
      expect(e.response.data.message).toBe('Room not available');
    }
  });
});
