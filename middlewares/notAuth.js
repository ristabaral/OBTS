const notAuth = async(req, res, next) => {
    let token = req.cookies.jwt;
    console.log(token.access_token)
    if (!token) {
        return res.redirect('/api/login');
    } else {
        next();
    }
}

export default notAuth;