// export default function getFilteredUrl(url: string): string {
//     const httpIndex = url.indexOf('http://');
//     const httpsIndex = url.indexOf('https://');

//     const startIndex = httpIndex !== -1
//         ? (httpsIndex !== -1 ? Math.min(httpIndex, httpsIndex) : httpIndex)
//         : httpsIndex;

//     return startIndex !== -1 ? url.slice(startIndex) : url;
// }
// export default function getFilteredUrl(url: string): string {
//     const httpsIndex = url.indexOf('https://');
//     console.log(httpsIndex);
//     return httpsIndex !== -1 ? url.slice(httpsIndex) : url;

// }

export default function getFilteredUrl(url: string): string {
    const httpIndex = url.indexOf('http://');
    const httpsIndex = url.indexOf('https://');

    const firstIndex = httpIndex !== -1
        ? (httpsIndex !== -1 ? Math.min(httpIndex, httpsIndex) : httpIndex)
        : httpsIndex;

    if (firstIndex === -1) {
        return url;
    }

    const secondHttpIndex = url.indexOf('http://', firstIndex + 1);
    const secondHttpsIndex = url.indexOf('https://', firstIndex + 1);
    const secondIndex = secondHttpIndex !== -1
        ? (secondHttpsIndex !== -1 ? Math.min(secondHttpIndex, secondHttpsIndex) : secondHttpIndex)
        : secondHttpsIndex;

    if (secondIndex !== -1) {
        return url.slice(secondIndex);
    }

    return url;
}
