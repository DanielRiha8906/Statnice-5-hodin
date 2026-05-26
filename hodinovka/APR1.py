def test_of_parantheses(text: str) -> bool:
    """
        Testuje, zda jsou kulaté závorky správně uzávorkované.
        Příklad chybného uzávorkování: ")(())("
    """
    para_count = 0
    for c in text:
        if c == "(":
            para_count += 1
        elif c == ")":
            para_count -= 1
    if para_count == 0:
        return True
    else:
        return False


def test_text(text:str, pair_of_opening_and_closing_par: tuple) -> bool:
    if text == "":
        raise ValueError("Text nesmí být prázdný.")
    para_count = 0
    for c in text:
        if c == pair_of_opening_and_closing_par[0]:
            para_count += 1
        elif c == pair_of_opening_and_closing_par[1]:
            para_count -= 1
            if para_count < 0:
                return False
    if para_count == 0:
        return True
    else:
        return False


def test_max_depth(text:str, pair_of_opening_and_closing_par: tuple) -> int:
    if text == "":
        raise ValueError("Text nesmí být prázdný.")
    para_count = 0
    max_depth = 0
    for c in text:
        if c == pair_of_opening_and_closing_par[0]:
            para_count += 1
            if max_depth < para_count:
                max_depth = para_count
        elif c == pair_of_opening_and_closing_par[1]:
            para_count -= 1
            if para_count < 0:
                raise ValueError("Závorky nejsou správně uzávorkované.")
    if para_count == 0:
        return max_depth
    else:
        raise ValueError("Závorky nejsou správně uzávorkované.")