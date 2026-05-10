const axios = require('axios');

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { username, password } = JSON.parse(event.body);
    const INTERNAL_API_URL = "https://yang-advisors-mtv-adoption.trycloudflare.com/auth";

    // 1. Flask 서버로 인증 요청 보냄
    const response = await axios.post(INTERNAL_API_URL, {
      username: username,
      password: password
    }, {
      timeout: 5000 
    });

    // 2. Flask가 보내준 데이터를 그대로 받아서 클라이언트에 전달
    // Flask에서 보낸 {"status": "success", "data": "..."} 등이 여기에 담깁니다.
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        status: "success", 
        message: "FreeIPA 인증 완료",
        user: username,
        data: response.data.data // Flask가 준 'data' 필드를 프론트엔드에 전달
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        status: "fail", 
        message: message 
      })
    };
  }
};