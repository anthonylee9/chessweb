import tensorflow as tf
from tensorflow import keras
import chess
import time
from keras.models import load_model
'''
Traditional Heuristic
'''
def evaluate_position(board):
    evaluation = 0.0

    # Piece values
    piece_values = {
        chess.PAWN: 1,
        chess.KNIGHT: 3,
        chess.BISHOP: 3,
        chess.ROOK: 5,
        chess.QUEEN: 9
    }

    # Evaluate pieces on the board
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece is not None:
            piece_value = piece_values.get(piece.piece_type, 0)
            if piece.color == chess.WHITE:
                evaluation += piece_value
            else:
                evaluation -= piece_value

    # Evaluate control of the center
    evaluation += evaluate_control_of_center(board)

    # Evaluate material balance
    evaluation += evaluate_material_balance(board)
    
    evaluation += evaluate_threats(board)

    return evaluation

def evaluate_control_of_center(board):
    # Example: Reward control of central squares
    control_of_center_score = 0.0
    center_squares = {chess.E4, chess.D4, chess.E5, chess.D5}
    for square in center_squares:
        piece = board.piece_at(square)
        if piece is not None:
            if piece.color == chess.WHITE:
                control_of_center_score += 0.1
            else:
                control_of_center_score -= 0.1
    return control_of_center_score

def evaluate_material_balance(board):
    # Example: Reward for material advantage
    white_material = sum(1 for piece in board.piece_map().values() if piece.color == chess.WHITE)
    black_material = sum(1 for piece in board.piece_map().values() if piece.color == chess.BLACK)
    material_balance_score = (white_material - black_material) * 0.1
    return material_balance_score

def evaluate_threats(board):
    threats_score = 0.0
    
    piece_values = {
        chess.PAWN: 1,
        chess.KNIGHT: 3,
        chess.BISHOP: 3,
        chess.ROOK: 5,
        chess.QUEEN: 9
    }
    
    for move in board.legal_moves:
        if board.is_capture(move):
            captured_piece = board.piece_at(move.to_square)
            if captured_piece is not None:
                if captured_piece.color == chess.WHITE:
                    threats_score -= piece_values.get(captured_piece.piece_type, 0)
                else:
                    threats_score += piece_values.get(captured_piece.piece_type, 0)
    return threats_score*0.5

'''
ML model preprocessing for prediction
'''
def fen_to_2d_array_with_values(fen):
    """Convert a FEN string into a 2D array representation with piece values."""
    piece_values = {
        'p': -1, 'n': -3, 'b': -3.5, 'r': -5, 'q': -9, 'k': -100,  # Black pieces
        'P': 1, 'N': 3, 'B': 3.5, 'R': 5, 'Q': 9, 'K': 100,       # White pieces
        '.': 0  # Empty square
    }

    board = []
    rows = fen.split(' ')[0].split('/')
    for row in rows:
        board_row = []
        for char in row:
            if char.isdigit():
                board_row.extend([0] * int(char))  # Expand empty squares
            else:
                board_row.append(piece_values[char])
        board.append(board_row)
    return board


'''
Evaluate position
'''
def evaluate_position_combined(fen, keras_model, traditional_weight=0.5, model_weight=0.5):
    # Evaluate position using the traditional heuristic
    board = chess.Board(fen)
    traditional_evaluation = evaluate_position(board)

    # Evaluate position using Keras model
    toPred = [fen_to_2d_array_with_values(fen)]
    model_evaluation = keras_model.predict(toPred)[0][0]

    # Combine evaluations using a weighted average
    combined_evaluation = (traditional_weight * traditional_evaluation) + (model_weight * model_evaluation)

    return combined_evaluation


# model = keras.models.load_model('chessModel1mil.keras')
model = keras.models.load_model('test.keras')

'''
Make a move
'''
def minimax(board, depth, alpha, beta, maximizingPlayer, start_time, time_limit):
    """
    Minimax algorithm with alpha-beta pruning.
    """
    if time.time() - start_time > time_limit or board.is_game_over():
        return evaluate_position_combined(board.fen(), model)  # Convert board state to FEN for evaluation
    
    if depth == 0:
        return evaluate_position_combined(board.fen(), model)

    if maximizingPlayer:
        maxEval = float('-inf')
        for move in board.legal_moves:
            board.push(move)
            eval = minimax(board, depth-1, alpha, beta, False, start_time, time_limit)
            board.pop()
            if eval is None:  # Time limit exceeded
                return None
            maxEval = max(maxEval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break
        return maxEval
    else:
        minEval = float('inf')
        for move in board.legal_moves:
            board.push(move)
            eval = minimax(board, depth-1, alpha, beta, True, start_time, time_limit)
            board.pop()
            if eval is None:  # Time limit exceeded
                return None
            minEval = min(minEval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break
        return minEval
    
def find_best_move(board, max_depth, time_limit):
    best_move = None
    best_value = float('-inf') if board.turn else float('inf')
    start_time = time.time()
    
    for move in board.legal_moves:
        board.push(move)
        move_eval = minimax(board, max_depth - 1, float('-inf'), float('inf'), board.turn, start_time, time_limit)
        board.pop()
        if move_eval is None:  # Time limit exceeded
            break
        if board.turn:  # White's turn, looking for max value
            if move_eval > best_value:
                best_value = move_eval
                best_move = move
        else:  # Black's turn, looking for min value
            if move_eval < best_value:
                best_value = move_eval
                best_move = move
    
    return best_move


'''
Example Use
'''
board = chess.Board()  # Initialize the board
max_depth = 3  # Example depth
time_limit = 3  # 10 seconds time limit
best_move = find_best_move(board, max_depth, time_limit)
print("Best move:", best_move)
board.push(best_move)
print(board)