let express = require("express");
let app = express();
let cors = require("cors");
let axios = require('axios');

app.use(cors());
app.use(express.json())

app.use(express.static("build"));

app.post("/", async function (req, res) {
  const responseObject = {};
  const requestBody = req.body
  const oauthGrantCode = requestBody.codeFromPatreon;
  const CLIENT_ID = requestBody.clientID;
  const CLIENT_SECRET = requestBody.secretKey;
  const redirectURL = requestBody.redirectURI;
  const campaignId = requestBody.campaignId;
  const memberId = requestBody.memberId;
  const postId = requestBody.postId;
  const endpoints = requestBody.endpoints;
  let accessToken;

  try {
  let message = {
    url: `https://www.patreon.com/api/oauth2/token?code=${oauthGrantCode}&grant_type=authorization_code&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${redirectURL}`,
    method: `POST`,
    headers: {
      'Content-Type': `application/x-www-form-urlencoded`
    }
  }
  let response = await axios(message)
  accessToken = response.data.access_token;
} catch (error) {
  res.end({error:'UNABLE TO LOGIN'})
}


  if (endpoints['/api/oauth2/v2/identity'].required) {
    try {
      message = {
        url: encodeURI(`https://www.patreon.com/api/oauth2/v2/identity${endpoints['/api/oauth2/v2/identity'].queryParams}`),
        method: `GET`,
        headers: {
          'authorization': `Bearer ${accessToken}`,
          'Content-Type': `application/x-www-form-urlencoded`
        }
      }
      response = await axios(message)
      responseObject['/api/oauth2/v2/identity'] = response.data
    } catch (error) {
      responseObject['/api/oauth2/v2/identity'] = error
    }
  }

  if (endpoints['/api/oauth2/v2/campaigns'].required) {
    try {
      message = {
        url: encodeURI(`https://www.patreon.com/api/oauth2/v2/campaigns${endpoints['/api/oauth2/v2/campaigns'].queryParams}`),
        method: `GET`,
        headers: {
          'authorization': `Bearer ${accessToken}`,
          'Content-Type': `application/x-www-form-urlencoded`
        }
      }
      response = await axios(message)
      responseObject['/api/oauth2/v2/campaigns'] = response.data
    } catch (error) {
      responseObject['/api/oauth2/v2/campaigns'] = error
    }
  }

  if (endpoints['/api/oauth2/v2/campaigns/{campaign_id}'].required) {
    try {
      message = {
        url: encodeURI(`https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}${endpoints['/api/oauth2/v2/campaigns/{campaign_id}'].queryParams}`),
        method: `GET`,
        headers: {
          'authorization': `Bearer ${accessToken}`,
          'Content-Type': `application/x-www-form-urlencoded`
        }
      }
      response = await axios(message)
      responseObject['/api/oauth2/v2/campaigns/{campaign_id}'] = response.data
    } catch (error) {
      responseObject['/api/oauth2/v2/campaigns/{campaign_id}'] = error
    }
  }

  if (endpoints['/api/oauth2/v2/campaigns/{campaign_id}/members'].required) {
    try {
      message = {
        url: encodeURI(`https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/members${endpoints['/api/oauth2/v2/campaigns/{campaign_id}/members'].queryParams}`),
        method: `GET`,
        headers: {
          'authorization': `Bearer ${accessToken}`,
          'Content-Type': `application/x-www-form-urlencoded`
        }
      }
      response = await axios(message)
      responseObject['/api/oauth2/v2/campaigns/{campaign_id}/members'] = response.data
    } catch (error) {
      responseObject['/api/oauth2/v2/campaigns/{campaign_id}/members'] = error
    }
  }

  if (endpoints['/api/oauth2/v2/members/{id}'].required) {
    try {
      message = {
        url: encodeURI(`https://www.patreon.com/api/oauth2/v2/members/${memberId}${endpoints['/api/oauth2/v2/members/{id}'].queryParams}`),
        method: `GET`,
        headers: {
          'authorization': `Bearer ${accessToken}`,
          'Content-Type': `application/x-www-form-urlencoded`
        }
      }
      response = await axios(message)
      responseObject['/api/oauth2/v2/members/{id}'] = response.data
    } catch (error) {
      responseObject['/api/oauth2/v2/members/{id}'] = error
    }
  }

if (endpoints['/api/oauth2/v2/campaigns/{campaign_id}/posts'].required) {
  try {
    message = {
      url: encodeURI(`https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/posts${endpoints['/api/oauth2/v2/campaigns/{campaign_id}/posts'].queryParams}`),
      method: `GET`,
      headers: {
        'authorization': `Bearer ${accessToken}`,
        'Content-Type': `application/x-www-form-urlencoded`
      }
    }
    response = await axios(message)
    responseObject['/api/oauth2/v2/campaigns/{campaign_id}/posts'] = response.data
  } catch (error) {
    responseObject['/api/oauth2/v2/campaigns/{campaign_id}/posts'] = error
  }
}

if (endpoints['/api/oauth2/v2/posts/{id}'].required) {
  try {
    message = {
      url: encodeURI(`https://www.patreon.com/api/oauth2/v2/posts/${postId}${endpoints['/api/oauth2/v2/posts/{id}'].queryParams}`),
      method: `GET`,
      headers: {
        'authorization': `Bearer ${accessToken}`,
        'Content-Type': `application/x-www-form-urlencoded`
      }
    }
    response = await axios(message)
    responseObject['/api/oauth2/v2/posts/{id}'] = response.data
  } catch (error) {
    responseObject['/api/oauth2/v2/posts/{id}'] = error
  }
}

res.json(responseObject)
});



let server = app.listen(8080, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log("Patreon POC listening at http://%s:%s", host, port);
});