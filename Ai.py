import math
import sys

n = len(sys.argv)

move = sys.argv[1]
# These will need to be changed when we get the actual values from the game
# total amount of moves called this will eventually be huge might need to change it or mod it but will work for what we need right now
total = 0
RowCountA = 0
RowCountB = 0
RowCountC = 0
RowCountD = 0
# gets the percentage for each move that is called
moveA = 0
moveB = 0
moveC = 0
moveD = 0
statsA = 0
statsB = 0
statsC = 0
statsD = 0

# basically what we want to do is moveA,B,C,D/totalmovesUsed = stats for each move, and from there we will use the computer to compare the stats
# to decide what move to use to counter them or if they should use a health effect
# so once we get the stats for the total used we can start to see patterns in certain play styles that will allow the bot to counter them
# using some basic ideologys like water > fire > grass

# This will be changed to what the number 0 move is so normal
if move == "normal":
    # can change this if you want using it to check amount of times used in a row
    RowCountB = 0
    RowCountC = 0
    RowCountD = 0

    moveA = moveA + 1
    total = total + 1
    statsA = moveA/total
    RowCountA = RowCountA + 1

elif move == "special":
    # can change this if you want using it to check amount of times used in a row
    RowCountA = 0
    RowCountC = 0
    RowCountD = 0
    #---------------
    moveB = moveB + 1
    total = total + 1
    statsB = moveB/total
    RowCountB = RowCountB + 1

elif move == "elemental":
    # can change this if you want using it to check amount of times used in a row
    RowCountA = 0
    RowCountB = 0
    RowCountD = 0

    moveC == moveC + 1
    total = total + 1
    statsC = moveC/total
    RowCountC = RowCountC + 1

elif move == "defense":
    # can change this if you want using it to check amount of times used in a row
    RowCountA = 0
    RowCountB = 0
    RowCountC = 0

    moveD = moveD + 1
    total = total + 1
    statsD = moveD/total
    RowCountD = RowCountD + 1
# Move Math/Running
# Stuff for move 1
# will fix this in the morning
if statsA > statsB and statsA > statsC and statsA > statsD:

    if RowCountA > 1:
        p2.move = "special" # so leer
    if p1.type == fire and p2.type == water:
        p2.move = "elemental" # so waterjet
    elif p1.type == water and p2.type == grass:
            p2.move = "elemental" # so waterjet
    elif p1.type == grass and p2.type == fire:
            p2.move = "elemental"
    if statsA > 0.5:
        p2.move = "special"
    elif statsA < 0.1:
        p2.move = "defense"

if statsB > statsA and statsB > statsC and statsB > statsD:

    if RowCountB  > 1:
        p2.move = "normal" # so tackel
    # checks type mismatch to use elemental attack
    if p1.type == fire and p2.type == water:
        p2.move = "elemental" # so waterjet
    elif p1.type == water and p2.type == grass:
            p2.move = "elemental" # so grassnot
    elif p1.type == grass and p2.type == fire:
            p2.move = "elemental"

    if statsB > 0.5:
        p2.move = "normal"
    elif statsB < 0.1:
        p2.move = "defense"

if statsC > statsA and statsC > statsB and statsC > statsD:

    if RowCountC  > 1:
        p2.move = "defense" # so tackel
    # checks type mismatch to use elemental attack
    if p1.type == fire and p2.type == water:
        p2.move = "elemental" # so waterjet
    elif p1.type == water and p2.type == grass:
            p2.move = "elemental" # so grassnot
    elif p1.type == grass and p2.type == fire:
            p2.move = "elemental"

    if statsC > 0.5:
        p2.move = "special"
    elif statsC < 0.1:
        p2.move = "normal"

if statsD > statsA and statsD > statsB and statsD > statsC:

    if RowCountC  > 1:
        p2.move = "special" # so tackel
    # checks type mismatch to use elemental attack
    if p1.type == fire and p2.type == water:
        p2.move = "elemental" # so waterjet
    elif p1.type == water and p2.type == grass:
            p2.move = "elemental" # so grassnot
    elif p1.type == grass and p2.type == fire:
            p2.move = "elemental"

    if statsC > 0.5:
        p2.move = "elemental"
    elif statsC < 0.1:
        p2.move = "defense"
