/**
 * Utility to convert numbers to Arabic words (Tafqeet)
 * Specifically tailored for Egyptian Pounds (EGP)
 */

export const toArabicWords = (amount: number): string => {
    if (amount === 0) return "صفر جنية مصري";

    const parts = amount.toString().split(".");
    const piasters = parts[1] ? parseInt(parts[1].substring(0, 2).padEnd(2, '0')) : 0;
    const pounds = parseInt(parts[0]);

    let output = "فقط ";

    if (pounds > 0) {
        output += NumberToArabic(pounds) + " جنيهاً مصرياً";
    }

    if (piasters > 0) {
        if (pounds > 0) output += " و ";
        output += NumberToArabic(piasters) + " قرشاً";
    }

    return output + " لا غير";
};

const NumberToArabic = (n: number): string => {
    if (n === 0) return "";

    const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
    const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
    const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

    if (n < 20) return ones[n];
    if (n < 100) return (n % 10 === 0 ? "" : ones[n % 10] + " و ") + tens[Math.floor(n / 10)];
    if (n < 1000) {
        const h = Math.floor(n / 100);
        const rem = n % 100;
        return hundreds[h] + (rem === 0 ? "" : " و " + NumberToArabic(rem));
    }
    if (n < 1000000) {
        const thousand = Math.floor(n / 1000);
        const rem = n % 1000;
        let prefix = "";
        if (thousand === 1) prefix = "ألف";
        else if (thousand === 2) prefix = "ألفان";
        else if (thousand <= 10) prefix = ones[thousand] + " آلاف";
        else prefix = NumberToArabic(thousand) + " ألف";

        return prefix + (rem === 0 ? "" : " و " + NumberToArabic(rem));
    }

    return n.toString();
};
