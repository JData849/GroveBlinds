module.exports = {
    name: "Grove Blind & Shutter Co.",
    email: "info@groveblindsuk.com",
    phoneForTel: "08000 599579",
    phoneFormatted: "08000 599579",
    address: {
        lineOne: "206g, Newton Road",
        lineTwo: "Lowton",
        city: "Warrington",
        state: "Cheshire",
        zip: "WA3 2AQ",
        country: "UK",
        mapLink: "https://maps.app.goo.gl/1qbHAuTiq5TQFF8S8",
    },
    socials: {
        facebook: "https://www.facebook.com/groveblindandshutters",
        instagram: "https://www.instagram.com/",
    },
    //! Make sure you include the file protocol (e.g. https://) and that NO TRAILING SLASH is included
    domain: "https://groveblindsuk.com",
    // Passing the isProduction variable for use in HTML templates
    isProduction: process.env.ELEVENTY_ENV === "PROD",
};
