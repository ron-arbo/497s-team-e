import React from 'react';
import axios from 'axios';
import { GoogleLogin } from 'react-google-login';
// refresh token
import { refreshTokenSetup } from '../refreshToken.js';

const clientId =
  '350429252210-hq617ss9idkeat0h66hbop59ul53mpnf.apps.googleusercontent.com';

function Login() {
  const onSuccess = (res) => {
    console.log('Login Success: currentUser:', res.profileObj);
    alert(
      `Logged in successfully, welcome ${res.profileObj.name}. \n See console for full profile object.`
    );
    refreshTokenSetup(res);
    const outer = this;
    const instance = axios.create({ timeout: 10000 });
    instance.defaults.headers.common['Content-Type'] = 'application/json';
    instance.defaults.headers.common['Authorization'] = res.getAuthResponse().id_token;
    instance
      .post('http://' + window.location.hostname + '/gcal/auth', res)
      .then(res => {
        console.log(res);
        //outer.setState({ eventExportResponse: res });
      })
      .catch(err => {
        console.log(err);
        //outer.setState({ eventExportResponse: err });
      });
  };

  const onFailure = (res) => {
    console.log('Login failed: res:', res);
    alert(
      `Failed to login. Please ping this to repo owner twitter.com/sivanesh_fiz`
    );
  };

  return (
    <div>
      <GoogleLogin
        clientId={clientId}
        buttonText="Login"
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={'single_host_origin'}
        style={{ marginTop: '100px' }}
        isSignedIn={true}
      />
    </div>
  );
}

export default Login;