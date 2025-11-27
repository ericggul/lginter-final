// hue.js



// 간단한 Philips Hue Bridge Pro v2 제어 스크립트



// 사용법 (터미널에서):



//   node hue.js list                // 조명 목록 보기



//   node hue.js on                  // LIGHT_ID 켜기



//   node hue.js off                 // LIGHT_ID 끄기



//   node hue.js brightness 30       // 밝기 30%



//   node hue.js color 0.3 0.3       // xy 색상 설정



const axios = require("axios");



const https = require("https");



// 🔧 여기를 네 환경에 맞게 바꾸면 됨



const BRIDGE_IP = "172.20.10.3"; // 네 브리지 IP



const APP_KEY = "ZCzLy9nb1wmte72Y5sbyGMcKD3JFIqvqE5oqGLJA"; // debug/clip.html에서 만든 application key



const LIGHT_ID = "5d1caa8e-a112-4e33-8362-e7483fcd2d84"; // 방금 JSON에서 본 id



// HTTPS 요청용 axios 인스턴스



const api = axios.create({



  baseURL: `https://${BRIDGE_IP}`,



  headers: {



    "hue-application-key": APP_KEY,



    "Content-Type": "application/json",



  },



  httpsAgent: new https.Agent({



    rejectUnauthorized: false, // 브리지 자체 서명 인증서 무시 (로컬 개발용)



  }),



});



async function listLights() {



  const res = await api.get("/clip/v2/resource/light");



  const lights = res.data.data || [];



  console.log("=== Lights ===");



  lights.forEach((l) => {



    console.log(



      `id: ${l.id}\n  name: ${l.metadata?.name}\n  on: ${l.on?.on}\n  brightness: ${l.dimming?.brightness}\n`



    );



  });



}



async function setOnOff(on) {



  await api.put(`/clip/v2/resource/light/${LIGHT_ID}`, {



    on: { on },



  });



  console.log(`Light ${LIGHT_ID} → ${on ? "ON" : "OFF"}`);



}



async function setBrightness(brightness) {



  await api.put(`/clip/v2/resource/light/${LIGHT_ID}`, {



    on: { on: true },



    dimming: { brightness }, // 0 ~ 100



  });



  console.log(`Light ${LIGHT_ID} → brightness ${brightness}`);



}



async function setColorXY(x, y) {



  await api.put(`/clip/v2/resource/light/${LIGHT_ID}`, {



    on: { on: true },



    color: {



      xy: { x, y },



    },



  });



  console.log(`Light ${LIGHT_ID} → color xy(${x}, ${y})`);



}



// CLI 처리



async function main() {



  const [, , cmd, ...args] = process.argv;



  try {



    switch (cmd) {



      case "list":



        await listLights();



        break;



      case "on":



        await setOnOff(true);



        break;



      case "off":



        await setOnOff(false);



        break;



      case "brightness":



        const b = parseFloat(args[0]);



        if (isNaN(b)) {



          console.error("사용법: node hue.js brightness 30");



          break;



        }



        await setBrightness(b);



        break;



      case "color":



        const x = parseFloat(args[0]);



        const y = parseFloat(args[1]);



        if (isNaN(x) || isNaN(y)) {



          console.error("사용법: node hue.js color 0.3 0.3");



          break;



        }



        await setColorXY(x, y);



        break;



      default:



        console.log("사용법:");



        console.log("  node hue.js list");



        console.log("  node hue.js on");



        console.log("  node hue.js off");



        console.log("  node hue.js brightness 30");



        console.log("  node hue.js color 0.3 0.3");



    }



  } catch (err) {



    console.error("Error:");



    if (err.response) {



      console.error(JSON.stringify(err.response.data, null, 2));



    } else {



      console.error(err.message);



    }



  }



}



main();

