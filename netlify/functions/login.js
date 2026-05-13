const axios = require('axios');

exports.handler = async (event, context) => {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {

    const { username, password } = JSON.parse(event.body);

    const INTERNAL_API_URL =
      "https://books-foods-airports-arch.trycloudflare.com/auth";

    const response = await axios.post(
      INTERNAL_API_URL,
      {
        username,
        password
      },
      {
        timeout: 5000,

        // 세션 쿠키 허용
        withCredentials: true,

        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    // Flask 세션 쿠키 가져오기
    const cookies = response.headers['set-cookie'];

    return {
      statusCode: 200,

      headers: {
        "Content-Type": "application/json",

        // 쿠키 전달
        "Set-Cookie": cookies,

        // CORS
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true"
      },

      body: JSON.stringify({
        status: "success",
        message: "FreeIPA 인증 완료",
        user: username,
        data: response.data.data
      })
    };

  } catch (error) {

    console.error(
      "Auth Error:",
      error.response?.data || error.message
    );

    let message = "인증 서버에 연결할 수 없습니다.";

    if (error.response?.status === 401) {
      message = "아이디 또는 비밀번호가 틀렸습니다.";
    }

    return {

      statusCode: error.response?.status || 500,

      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true"
      },

      body: JSON.stringify({
        status: "fail",
        message
      })
    };
  }
};