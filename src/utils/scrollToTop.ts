const scrollToTop = (top: number = 0) => {
    window.scrollTo({
        top: top,
        behavior: 'smooth'
    });
};

export default scrollToTop;