# UINGame Authenication Server

SAML 2.0 Service Provider
Authenticates with [education.gov.ip Identity Provider](https://is.remote.education.gov.il/nidp/saml2/metadata)

## Local Setup
tools
1. [git](https://git-scm.com/download/win) (to upload to production)
2. [heroku-cli](https://devcenter.heroku.com/articles/heroku-cli) (to upload and manage to production)
3. `certbot` (for obtaining certificates from [Let's Encrypt](https://letsencrypt.org/))
4. `nodejs` and `yarn` (for local development)

## Uploading to production
Uploading to heroku is done using git.

Setup your repository using the `heroku` cli:
```sh
heroku login
heroku git:remote -a uingame-auth
```

Now you can upload by pushing to the heroku remote running:
```sh
git push heroku master
```

## Monitoring production
In order to see the live log from production run:
```sh
heroku logs --tails
```
It is useful to run this while restarting the server, changing environment variables, etc.

## Getting a real certificate
1. Install `certbot`
2. Run `sudo certbot certonly --manual`
3. Type `auth.uingame.co.il` when the prompt asks for a domain name
4. You should have a url and a secret string
Go to [https://dashboard.heroku.com/apps/uingame-auth/settings](here) and add them as environment variables named `ACME_CHALLENGE_URL` and `ACME_CHALLENGE_STRING`
Add the URL **without** the domain name (ex. '.well-known/acme-challenge/')
5. Go to the provided url and make sure the string is returned
6. Click enter back in the terminal
    1. The certificate is saved in: `/etc/letsencrypt/live/auth.uingame.co.il/fullchain.pem` (it's the first one)
    2. Private key is saved in: `/etc/letsencrypt/live/auth.uingame.co.il/privkey.pem`
7. Remove the environment variables from heroku (from step 4)
8. To renew `sudo certbot renew`

## Test Profiles:
<table style="direction: rtl">
  <thead>
    <td>סוג</td>
    <td>זהות</td>
    <td>קוד</td>
    <td>סיסמא</td>
    <td>מוסד וכיתה<td>
    <td>profile</td>
  </thead>
  <tbody>
    <tr>
      <td>תלמיד</td>
      <td>0216636092</td>
      <td>2933523</td>
      <td>2253</td>
      <td>418400 - יסודי ערבי נווה שלום ה/2</td>
      <td>
        <pre style="direction: ltr">
{
  "issuer": "https://is.remote.education.gov.il/nidp/saml2/metadata",
  "sessionIndex": "idiY1dyZP15I5N_MFg2IAPmRAmtcM",
  "nameID": "xP9Oq4k9qRsDNUAQbj9PF2o8TRphNkYYX7D/jg==",
  "nameIDFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
  "nameQualifier": "https://is.remote.education.gov.il/nidp/saml2/metadata",
  "spNameQualifier": "http://auth.uingame.co.il",
  "http://schemas.education.gov.il/ws/2015/01/identity/claims/studentmakbila": "2",
  "http://schemas.education.gov.il/ws/2015/01/identity/claims/studentmosad": "418400",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "0216636092",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname": "ג'אדי",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname": "טראבין",
  "http://schemas.education.gov.il/ws/2015/01/identity/claims/zehut": "216636092",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/displayname": "ג'אדי טראבין",
  "http://schemas.education.gov.il/ws/2015/01/identity/claims/studentkita": "5",
  "http://schemas.education.gov.il/ws/2015/01/identity/claims/orgrolesyeshuyot": "418400",
  "http://schemas.education.gov.il/ws/2015/01/identity/claims/isstudent": "Yes"
}
        </pre>
      </td>
    </tr>
    <tr>
      <td>בעל תפקיד</td>
      <td>0057626053</td>
      <td>1308918</td>
      <td>123qweASD</td>
      <td>903856 - גן טור</td>
      <td>
        <pre style="direction: ltr">
{
  "issuer": "https://is.remote.education.gov.il/nidp/saml2/metadata",
  "sessionIndex": "idBPNsA7JYXObk_Go3DZ6y1_VLtFQ",
  "nameID": "oT8ZmOFKRl+SJlMDfSxcBHguWAp/KlEPSKfomQ==",
  "nameIDFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
  "nameQualifier": "https://is.remote.education.gov.il/nidp/saml2/metadata",
  "spNameQualifier": "http://auth.uingame.co.il",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "0057626053",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname": "ח'יריה",
  "http://schemas.education.gov.il/ws/2015/01/identity/claims/orgrolecomplex": "667[Maarechet_hinuch:99999999]",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname": "עזאיזה",
  "http://schemas.education.gov.il/ws/2015/01/identity/claims/zehut": "057626053",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/displayname": "ח'יריה עזאיזה",
  "http://schemas.education.gov.il/ws/2015/01/identity/claims/orgrolessimple": "667[Maarechet_hinuch:99999999]",
  "http://schemas.education.gov.il/ws/2015/01/identity/claims/orgrolesyeshuyot": "99999999",
  "http://schemas.education.gov.il/ws/2015/01/identity/claims/isstudent": "No"
}
        </pre>
      </td>
    </tr>
  </tbody>
</table>
