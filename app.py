import random
from flask import Flask, jsonify, request
from flask_cors import CORS

# Initialize the Flask app
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# --- Your existing game logic is placed here ---
CHOICES = {"snake": 1, "water": -1, "gun": 0}
REVERSE = {1: "snake", -1: "water", 0: "gun"}
OUTCOMES = {
    (1, -1): 1,   # snake beats water
    (-1, 0): 1,   # water beats gun
    (0, 1): 1,   # gun beats snake
}

def get_computer_choice():
    """Randomly pick one of the choice codes."""
    return random.choice(list(REVERSE.keys()))

def decide_winner(player, comp):
    """Return 1 if player wins, -1 if player loses, 0 if draw."""
    if player == comp:
        return 0
    return OUTCOMES.get((player, comp), -1)
# --- End of game logic ---


# Define an API endpoint at the URL '/play'
# This function will run when the frontend sends a request to it.

@app.route('/play', methods=['POST'])
def play_round():
    # 1. Get the player's choice from the incoming request data
    data = request.json
    player_choice_name = data.get('choice')
    
    if player_choice_name not in CHOICES:
        return jsonify({"error": "Invalid choice"}), 400

    player_choice_value = CHOICES[player_choice_name]

    # 2. Run the game logic
    comp_choice_value = get_computer_choice()
    result_code = decide_winner(player_choice_value, comp_choice_value)

    # 3. Determine the result string
    if result_code == 1:
        result_text = "🎉 You Win!"
    elif result_code == -1:
        result_text = "💥 You Lose!"
    else:
        result_text = "😐 It's a Draw!"

    # 4. Send all the results back to the frontend as JSON
    response_data = {
        "playerChoice": REVERSE[player_choice_value].title(),
        "computerChoice": REVERSE[comp_choice_value].title(),
        "resultCode": result_code,
        "resultText": result_text
    }
    return jsonify(response_data)

# This makes the server run when you execute the script
if __name__ == '__main__':
    app.run(debug=True)