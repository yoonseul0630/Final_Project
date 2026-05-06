// netlify/functions/login.js
const axios = require('axios');

exports.handler = async (event, context) => {
  // POST 요청만 허용
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    // [중요] Cloudflare Tunnel을 통해 발급받은 실제 URL을 여기에 넣으세요.
    // 예: "https://auth-api.yourdomain.com/auth"
    const INTERNAL_API_URL = "여러분의_클라우드플레어_터널_주소/auth";

    // 내부망의 Python API로 인증 요청 전달
    const response = await axios.post(INTERNAL_API_URL, {
      username: username,
      password: password
    }, {
      timeout: 5000 // 5초 안에 응답 없으면 타임아웃
    });

    // 인증 성공 시 (Python API가 success: true를 보내준 경우)
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        status: "success", 
        message: "FreeIPA 인증 완료",
        user: username 
      })
    };

  } catch (error) {
    console.error("Auth Error:", error.message);
    
    let message = "인증 서버에 연결할 수 없습니다.";
    if (error.response && error.response.status === 401) {
      message = "아이디 또는 비밀번호가 틀렸습니다.";
    }

    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ status: "fail", message: message })
    };
  }
};