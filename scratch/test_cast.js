const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQxZWE2MDMyMmU3MzBmOGE3M2M3M2I1YThkOGVlYzM0ZTk4NDljMzBiNzAxMjVmYzZkY2U5YzZjMjU5OTgwZDA5NGUwZjQzYzJhZDFhZjcwIn0.eyJhdWQiOiJhY2xlZCIsImp0aSI6ImQxZWE2MDMyMmU3MzBmOGE3M2M3M2I1YThkOGVlYzM0ZTk4NDljMzBiNzAxMjVmYzZkY2U5YzZjMjU5OTgwZDA5NGUwZjQzYzJhZDFhZjcwIiwiaWF0IjoxNzc4Mzk5MzM1LCJuYmYiOjE3NzgzOTkzMzUsImV4cCI6MTc3ODQ4NTczNS40NTU3MTcsInNjb3BlIjpbImF1dGhlbnRpY2F0ZWQiXSwic3ViIjoiMTkzNTc1IiwiaXNzIjoiaHR0cHM6Ly9hY2xlZGRhdGEuY29tLyJ9.vJR1aJl7CHt7bQRZ3gQ91Z4eDgxYfr82DJWJAWqj4TJ6kmil5V_zRb6wl5a589R1COlF9VLg4XQfoiN8JgTBzkx_9SuWhqxVEvORBOKekgNfN-tclDTVnudk4OTjtmEb3_spaboxvpCXmvf8v3JPuJhidIjA58lG_Y2d6jFwY3o9alKeNT4EAYrA7i0H68kBykjkKu6tS2OzZUyz4lgg36spkT0OSIQYidUtde4_CiHXJ_gbV4c7qZX7OctXmITlzME5pAiAjtF1LmkorhG0kXay0Ddf6pS3SswpzFwR1jl6CTzOM64LuPxnG8qBTn6nUWk7Y6ovrJyoG6uK81kCbw';

function decodeJwt(token) {
  const payload = token.split('.')[1];
  return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
}

console.log(decodeJwt(token));

async function testFetch() {
  try {
    const response = await fetch('https://api.acleddata.com/cast/read', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(response.status);
    const data = await response.text();
    console.log(data.substring(0, 500));
  } catch (err) {
    console.error(err);
  }
}
testFetch();
