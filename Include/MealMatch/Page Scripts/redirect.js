const matchPageUrl = "/Pages/MealMatch/match.html";

function goToMatch(id) {
    const origin = window.location.origin;
    window.location.href = `${origin}${matchPageUrl}?id=${id}`;
}

export { goToMatch };