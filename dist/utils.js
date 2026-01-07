export function random(len) {
    let options = "nsdkjfhksjgfusbusddg65656";
    let lemgth = options.length;
    let ans = "";
    for (let i = 0; i < len; i++) {
        ans += options[Math.floor(Math.random() * lemgth)];
    }
    return ans;
}
//# sourceMappingURL=utils.js.map