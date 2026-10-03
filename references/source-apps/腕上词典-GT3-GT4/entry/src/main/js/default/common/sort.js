const fs = require("fs");
const { read } = require("jimp");
const encoder = new TextEncoder();

let working_path =
  "C:\\Users\\cnoim\\DevEcoStudioProjects\\weardict\\entry\\src\\main\\js\\default\\common";
let working_type = "a";
let working_dir = "\\dic_" + working_type;
let letter = "abcdefghijklmnopqrstuvwxyz";

let tmp_buffer = [];
let tmp_map = {};
let current_position = 0;

for (let i = 0; i < 26; i++) {
  tmp_map[letter[i]] = {};
  for (let u = 0; u < 26; u++) {
    tmp_map[letter[i]][letter[u]] = { a: 0, b: 0 };
  }
}

//const files_list = fs.readdirSync(working_path + working_dir);

async function get_sub_files(dir) {
  return new Promise((resolve) => {
    let sub_files_uri = working_path + working_dir + "\\" + dir;
    const sub_files_list = fs.readdirSync(sub_files_uri);
    sub_files_list.forEach(async (data) => {
      let string = await process_files(sub_files_uri, data);
      let array = encoder.encode(string);
      tmp_buffer = tmp_buffer.concat(Array.from(array));
      tmp_buffer.push(0);
	  if (array.length == 0) {
		delete tmp_map[dir][data[0]]
	  } else {
		tmp_map[dir][data[0]].a = array.length;
		tmp_map[dir][data[0]].b = current_position;
	  }
      current_position += array.length + 1;
    });
    resolve();
  });
}

async function process_files(dir, filename) {
  return new Promise((resolve) => {
    let read_obj = fs.readFileSync
    if (read_obj.length === 0) {
      resolve("");
    } else {
      let arr = [];
      if (working_type === "a") {
        read_obj.forEach((data) => {
          arr.push(data.a);
          arr.push(data.b);
          arr.push(data.c);
          arr.push(data.d);
          arr.push(data.e);
        });
      } else if (working_type === "b") {
        read_obj.forEach((data) => {
          arr.push(data.a);
          arr.push(data.b);
        });
      }
      const separate = "|";
      let str = arr[0];
      for (let i = 1, len = arr.length; i < len; i++) {
        str += separate + arr[i];
      }
      resolve(str);
    }
  });
}

/* files_list.forEach(async (data, index) => {
  await get_sub_files(data);
  if (index === files_list.length - 1) {
    fs.writeFileSync(
      working_path + "\\dic_" + working_type + ".bin",
      Buffer.from(tmp_buffer)
    );
    fs.writeFileSync(
      working_path + "\\dic_" + working_type + "_map.bin",
      JSON.stringify(tmp_map)
    );
    console.log(tmp_map);
  }
});
 */
async function test () {
  let string = await process_files()
  let buffer = Buffer.from(Array.from(encoder.encode(string)));
  fs.writeFileSync(working_path+"\\dict.bin",buffer)  
}

test();
