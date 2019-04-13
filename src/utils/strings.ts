const p = new RegExp("%s");

export const resolve = (data: any[]) => {
    let message = "";
    if (data && data.length > 0) {
        message = data[0];
        params(data).forEach((v, i) => {
            message = message.replace(p, v);
        });
    }

    return message;
};

const params = (data: any[]) => {
    if (data.length === 1) {
        return [];
    } else {
        return data.splice(1);
    }
};
