const request = require('supertest');
const server = require('./server');
const validateToken = require('./js/JWT');

server.db = {
    select: jest.fn(),
};

const validToken = 'lukaskaralis';

describe('User Tests', () => {
    test('Bandyti prisijungti su egzistuojančiu vartotoju', async () => {
        const userData = {
            email: 'Lukas3@gmail.com',
            password: 'lukas',
        };
        const response = await request(server)
            .post('/login-user')
            .send(userData);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('email');
        expect(response.body).toHaveProperty('accessToken');
    });

    test('Bandyti prisijungti su neegzistuojančiu vartotoju', async () => {
        const invalidUserData = {
            email: 'asdsad@example.com',
            password: 'asdsadsda',
        };
        const response = await request(server)
            .post('/login-user')
            .send(invalidUserData);
        expect(response.status).toBe(200);
        expect(response.body).toEqual('Elektroninis paštas arba slaptažodis neteisingas');
    });

    test('Prisijungti nenurodžius slaptažodžio', async () => {
        const invalidUserData = {
            email: 'Lukas3@gmail.com'
        };
        const response = await request(server)
            .post('/login-user')
            .send({invalidUserData});
        expect(response.status).toBe(500);
        expect(response.body).toEqual('Nepavyko prisijungti');
    });
    test('Prisijungti nenurodžius vartotojo vardo', async () => {
        const invalidUserData = {
            password: 'lukas'
        };
        const response = await request(server)
            .post('/login-user')
            .send({invalidUserData});
        expect(response.status).toBe(500);
        expect(response.body).toEqual('Nepavyko prisijungti');
    });

    test('Atnaujinti profilį, kol vartotojas nėra autentifikuotas', async () => {
        const updatedData = {
            name: 'NewName',
            surname: 'NewSurname',
            phone: '123456789',
            address: 'NewAddress',
        };

        const response = await request(server)
            .post('/update-profile')
            .send(updatedData);

        expect(response.status).toBe(400);
        expect(JSON.stringify(response.body)).toEqual('{"error":"User not Authenticated!"}');
    });
    test('Gauti klaidą bandant pamatyti vartotojo informaciją be autentifikacijos', async () => {
        const response = await request(server)
            .get('/user-info');

        expect(response.status).toBe(404);
    });
    test('Pateikiti HTML failą pagrindiniam puslapiui', async () => {
        const response = await request(server)
            .get('/');
        expect(response.status).toBe(200);
        expect(response.header['content-type']).toContain('text/html');
    });
    test('Pateikti HTML failą prisijungimo puslapiui', async () => {
        const response = await request(server)
            .get('/login');
        expect(response.status).toBe(200);
        expect(response.header['content-type']).toContain('text/html');
    });
    test('Pateikite HTML failą registracijos puslapyje', async () => {
        const response = await request(server)
            .get('/register');
        expect(response.status).toBe(200);
        expect(response.header['content-type']).toContain('text/html');
    });
    test('Sėkmingai užregistruoti naują vartotoją', async () => {
        const newUser = {
            name: 'JohnDoe',
            email: 'john3@example.com',
            password: 'password123',
        };
        const response = await request(server)
            .post('/register-user')
            .send(newUser);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', newUser.name);
        expect(response.body).toHaveProperty('email', newUser.email);
    });
    test('Bandykite užsiregistruoti vartotoją su ne visais laukais', async () => {
        const incompleteUser = {
            name: 'Janes',
        };
        const response = await request(server)
            .post('/register-user')
            .send(incompleteUser);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({});
    });
    test('Bandyti gauti vartotojo profilį be galiojančio tokeno', async () => {
        const response = await request(server)
            .get('/profile');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'User not Authenticated!' });
    });
    test('Bandyti atnaujinti vartotojo profilį be galiojančio tokeno', async () => {
        const updatedProfileData = {
            name: 'UpdatedName',
        };
        const response = await request(server)
            .post('/update-profile')
            .send(updatedProfileData);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'User not Authenticated!' });
    });
    test('Bandyti užregistruoti jau esanti vartotoją', async () => {
        const newUser = {
            name: 'JohnDoe',
            email: 'john@example.com',
            password: 'password123',
        };
        const response = await request(server)
            .post('/register-user')
            .send(newUser);
        expect(response.status).toBe(500);
    });
});
