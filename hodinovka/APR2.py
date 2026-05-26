def indexing(list_of_integers: list[int]) -> list[int]:
    listik = []
    index = 0
    for item in list_of_integers:
        if not isinstance(item, int):
            raise ValueError("Vstupní data musí být celá čísla.")
        if index % 2 == 1:
            item += 1
            listik.append(item)
        else: 
            listik.append(item)
        index += 1
    return listik
    