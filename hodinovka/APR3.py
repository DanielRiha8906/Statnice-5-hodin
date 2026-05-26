# Zadání: 

class Semaphore:
    colors = ["red", "yellow", "green"]
    def __init__(self, color:str):
        if color not in self.colors:
            raise ValueError("Neplatná barva semaforu.")
        self.color = color
    
    def __str__(self):
        return self.color
    
    def nextColor(self):
        """
        vrací semafor s následující barvou v sekvenci přepínání světel
        """
        return Semaphore(self.colors[(self.colors.index(self.color) + 1)% len(self.colors)]) 
        
    @property
    def stop(self):
        if self.color == "red" or self.color == "yellow":
            return True
        else:
            return False


    def __eq__(self, other):
        if isinstance(other, Semaphore):
            return self.color == other.color
        return False
    
    def __iter__(self):
        return self
    
    def __next__(self):
        current_index = self.colors.index(self.color)
        next_index = (current_index + 1) % len(self.colors)
        self.color = self.colors[next_index]
        return self

semafor = Semaphore("red")
semafor2 = Semaphore("red")
x = 0
for i in semafor:
    print(semafor)
    x +=1
    if x == 10:
        break

print(semafor == semafor2)
print(semafor.nextColor())
