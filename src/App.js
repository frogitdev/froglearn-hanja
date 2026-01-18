import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// 초기 데이터 (요청하신 JSON 형식)
const INITIAL_DATA = require('./jlpt1026.json')
const JAPANESE_FONT = "'Rounded Mplus 1c'"

function App() {
    const [data, setData] = useState(INITIAL_DATA);
    const [dataFiltered, setDataFiltered] = useState(INITIAL_DATA);
    const [fontSelect, setSelected] = useState(JAPANESE_FONT);
    const [mode, setMode] = useState('study'); // study, quiz, review
    const [filtered, setFiltered] = useState(false);
    const [showSide, setShowSide] = useState(false); // study, quiz, review
    const [wrongAnswers, setWrongAnswers] = useState([]); // 틀린 문제 ID 배열

    const toggleSetShowSide = () => {
        setShowSide(showSide?false:true)
    }

    // 네비게이션 처리
    const renderContent = () => {
        switch (mode) {
            case 'study':
                return <StudyMode data={filtered ? dataFiltered : data} fontSelect={fontSelect} showSide={showSide} setData={setData} setShowSide={setShowSide} />;
            case 'quiz':
                return <QuizMode data={filtered ? dataFiltered : data} fontSelect={fontSelect} setWrongAnswers={setWrongAnswers} goReview={() => setMode('review')} />;
            case 'review':
                return <ReviewMode data={filtered ? dataFiltered : data} fontSelect={fontSelect} wrongAnswers={wrongAnswers} />;
            case 'settings':
                return <Settings data={data} fontSelect={fontSelect} setData={setData} setSelected={setSelected} />;
            default:
                return 0
        }
    };

    return (
        <div className="app-container">
            <header className="header">
                <button onClick={() => toggleSetShowSide()}><i class="fa fa-bars"></i></button>
                <nav>
                    <button onClick={() => setMode('study')} className={mode === 'study' ? 'active' : ''}>학습</button>
                    <button onClick={() => setMode('quiz')} className={mode === 'quiz' ? 'active' : ''}>퀴즈</button>
                    <button onClick={() => setMode('review')} className={mode === 'review' ? 'active' : ''}>오답노트 ({wrongAnswers.length})</button>
                </nav>
                <button onClick={() => setMode('settings')} className={mode === 'settings' ? 'active' : ''}><i class="fa fa-wrench"></i></button>
            </header>
            <main className="content">
                {renderContent()}
            </main>
        </div>
    );
}

// ----------------------------------------------------
// 1. 학습(외우기) 모드
// ----------------------------------------------------
// ----------------------------------------------------
// 1. 학습(외우기) 모드 - 상세 수정 기능 추가됨
// ----------------------------------------------------
function StudyMode({ data, setData, fontSelect, showSide, setShowSide }) {
    const [selectedId, setSelectedId] = useState(Object.keys(data)[0]);
    const [focused, setFocused] = useState(false);
    const myRef = useRef(null);
    const otherRef = useRef(null);

    useEffect(() => {
        if (showSide) {
            myRef.current.scrollIntoView({block: 'center'})
        }
    }, [showSide])
    
    // 새 한자 추가
    const handleAdd = () => {
        const newId = Date.now();
        // 구조: [한자, 훈음, 설명, [비슷한한자배열], [관련한자어배열]]
        const newEntry = ["", "", "", [], []]; 
        setData({ ...data, [newId]: newEntry });
        setSelectedId(newId);
    };

    // 기본 텍스트 데이터 수정 (인덱스 0, 1, 2)
    const handleChange = (index, value) => {
        const newData = { ...data };
        newData[selectedId] = [...newData[selectedId]]; // 배열 복사
        newData[selectedId][index] = value;
        setData(newData);
    };

    /**
     * 하위 배열 데이터 수정 핸들러
     * @param {number} dataIndex - 3(비슷한한자) 또는 4(관련한자어)
     * @param {number} rowIndex - 배열 내의 몇 번째 항목인지
     * @param {number} colIndex - 0(한자) 또는 1(훈음)
     * @param {string} value - 입력값
     */
    const handleArrayItemChange = (dataIndex, rowIndex, colIndex, value) => {
        const newData = { ...data };
        // 깊은 복사를 통해 불변성 유지
        const targetArray = [...newData[selectedId][dataIndex]]; // 예: [[場, 장소 장], ...]
        targetArray[rowIndex] = [...targetArray[rowIndex]]; // 내부 배열 복사
        targetArray[rowIndex][colIndex] = value; 
        
        newData[selectedId][dataIndex] = targetArray;
        setData(newData);
    };

    // 하위 배열 항목 추가
    const handleArrayAdd = (dataIndex) => {
        const newData = { ...data };
        const targetArray = [...newData[selectedId][dataIndex]];
        targetArray.push(["", ""]); // 빈 쌍 추가
        newData[selectedId][dataIndex] = targetArray;
        setData(newData);
    };

    // 하위 배열 항목 삭제
    const handleArrayRemove = (dataIndex, rowIndex) => {
        const newData = { ...data };
        const targetArray = newData[selectedId][dataIndex].filter((_, i) => i !== rowIndex);
        newData[selectedId][dataIndex] = targetArray;
        setData(newData);
    };

    return (
        <div className="study-container">
            {showSide && <div className="sidebar">
                {/* <div className="sidebar-header">
                    <h3>한자 목록</h3>
                    <button className="add-btn" onClick={handleAdd}>추가</button>
                </div> */}
                <ul>
                    {Object.entries(data).map(([id, item]) => (
                        <li 
                            key={id} 
                            onClick={() => {
                                setSelectedId(id)
                                setShowSide(false)
                            }}
                            className={String(selectedId) === String(id) ? 'selected' : ''}
                            ref={String(selectedId) === String(id) ? myRef : otherRef}
                        >
                            <span className="sub-number">{id.padStart(3,'0')}</span>
                            <span className="list-hanja" style={{fontFamily: fontSelect}}>{item[0] || "ㅁ"}</span> 
                            <span className="sub-text"><span className="favorite">{data[id][4][0] && "★ "}</span>{item[1] || "(미입력)"}</span>
                        </li>
                    ))}
                </ul>
            </div>}

            <div className="detail-view">
                {selectedId && data[selectedId] ? (
                    <div className="card edit-card" onClick={()=>setFocused(focused?false:true)}>
                        <div className="main-inputs">
                            <div className="form-group hanja-group">
                                {/* <input 
                                    type="text" 
                                    className="hanja-input"
                                    value={data[selectedId][0]} 
                                    onChange={(e) => handleChange(0, e.target.value)} 
                                    placeholder="한자"
                                    style={{fontFamily: fontSelect}}
                                /> */}
                                <p
                                    className="hanja-label"
                                    style={{fontFamily: fontSelect}}
                                >
                                    {data[selectedId][0]}
                                </p>
                            </div>
                            <div className="form-group">
                                <input 
                                    type="text" 
                                    className="full-input"
                                    style={{fontSize: '2em'}}
                                    value={data[selectedId][1]} 
                                    onChange={(e) => handleChange(1, e.target.value)} 
                                    placeholder="한자"
                                />
                            </div>
                            <div className="form-group">
                                <input 
                                    type="text"
                                    className="full-input"
                                    style={{fontSize: '1.2em', color: 'gray'}}
                                    value={data[selectedId][2]} 
                                    onChange={(e) => handleChange(2, e.target.value)} 
                                    placeholder="설명을 입력하세요"
                                />
                            </div>
                        </div>

                        <div className="array-editor-block">
                            {data[selectedId][3][0] && <h4><i class="fa fa-scale-unbalanced"></i></h4>}
                            {data[selectedId][3].map((item, rowIndex) => (
                                <div key={rowIndex} className="array-row">
                                    <input 
                                        type="text" 
                                        placeholder="한자"
                                        className="small-input"
                                        value={item[0]}
                                        onChange={(e) => handleArrayItemChange(3, rowIndex, 0, e.target.value)}
                                        style={{fontFamily: fontSelect}}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="훈음"
                                        className="mid-input"
                                        value={item[1]}
                                        onChange={(e) => handleArrayItemChange(3, rowIndex, 1, e.target.value)}
                                    />
                                </div>
                            ))}
                            {(!data[selectedId][3][0] || focused) && <button className="btn-add-small" onClick={() => handleArrayAdd(3)}>
                                + 비슷한 한자 추가
                            </button>}
                        </div>

                        <div className="array-editor-block">
                            {data[selectedId][4][0] && <h4><i class="fa fa-book"></i></h4>}
                            {data[selectedId][4].map((item, rowIndex) => (
                                <div key={rowIndex} className="array-row">
                                    <input 
                                        type="text" 
                                        placeholder="한자어"
                                        className="small-input"
                                        value={item[0]}
                                        onChange={(e) => handleArrayItemChange(4, rowIndex, 0, e.target.value)}
                                        style={{fontFamily: fontSelect}}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="뜻"
                                        className="mid-input"
                                        value={item[1]}
                                        onChange={(e) => handleArrayItemChange(4, rowIndex, 1, e.target.value)}
                                    />
                                </div>
                            ))}
                            {(!data[selectedId][4][0] || focused) && <button className="btn-add-small" onClick={() => handleArrayAdd(4)}>
                                + 관련 한자어 추가
                            </button>}
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">왼쪽 목록에서 한자를 선택하거나 추가하세요.</div>
                )}
            </div>
            <div className="navigation-btns">
                <button 
                    disabled={selectedId === '1'} 
                    onClick={() => setSelectedId((Number(selectedId) - 1).toString())}
                >
                    &lt; 이전
                </button>
                <button 
                    disabled={selectedId === (Object.keys(data).length).toString()} 
                    onClick={() => setSelectedId((Number(selectedId) + 1).toString())}
                >
                    다음 &gt;
                </button>
            </div>
        </div>
    );
}

// ----------------------------------------------------
// 2. 퀴즈 모드
// ----------------------------------------------------
function QuizMode({ data, setWrongAnswers, goReview, fontSelect }) {
    const [quizQueue, setQuizQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState({ correct: 0, wrong: 0 });
    const [isFinished, setIsFinished] = useState(false);

    // 퀴즈 시작 (랜덤 섞기)
    useEffect(() => {
        const ids = Object.keys(data);
        const shuffled = ids.sort(() => Math.random() - 0.5);
        setQuizQueue(shuffled);
        setWrongAnswers([]); // 새 퀴즈 시작 시 오답 초기화 (선택사항)
    }, []); // eslint-disable-line

    const handleAnswer = (known) => {
        const currentId = quizQueue[currentIndex];
        
        if (known) {
            setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
        } else {
            setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
            setWrongAnswers(prev => [...prev, currentId]);
        }

        if (currentIndex + 1 < quizQueue.length) {
            setCurrentIndex(prev => prev + 1);
            setShowAnswer(false);
        } else {
            setIsFinished(true);
        }
    };

    if (quizQueue.length === 0) return <div>문제 생성 중...</div>;

    if (isFinished) {
        return (
            <div className="result-container">
                <h2>퀴즈 종료!</h2>
                <div className="score-board">
                    <p>맞은 개수: {score.correct}</p>
                    <p>틀린 개수: {score.wrong}</p>
                </div>
                {score.wrong > 0 && (
                    <button className="review-link-btn" onClick={goReview}>오답노트 보러가기</button>
                )}
                <button onClick={() => window.location.reload()}>다시 하기</button>
            </div>
        );
    }

    const currentItem = data[quizQueue[currentIndex]];

    return (
        <div className="quiz-container">
            <div className="progress">문제 {currentIndex + 1} / {quizQueue.length}</div>
            <div className="quiz-card">
                <div className="quiz-hanja" style={{fontFamily: fontSelect}}>{currentItem[0]}</div>
                
                {showAnswer ? (
                    <div className="answer-section">
                        <div className="answer-text">{currentItem[1]}</div>
                        <div className="desc-text">{currentItem[2]}</div>
                        <div className="btn-group">
                            <button className="btn-yes" onClick={() => handleAnswer(true)}>알아요 (O)</button>
                            <button className="btn-no" onClick={() => handleAnswer(false)}>모르겠어요 (X)</button>
                        </div>
                    </div>
                ) : (
                    <button className="btn-show" onClick={() => setShowAnswer(true)}>정답 확인</button>
                )}
            </div>
        </div>
    );
}

// ----------------------------------------------------
// 3. 오답노트 모드
// ----------------------------------------------------
function ReviewMode({ data, wrongAnswers, fontSelect }) {
    const [reviewIndex, setReviewIndex] = useState(0);

    if (wrongAnswers.length === 0) {
        return <div className="empty-state">오답 데이터가 없습니다. 퀴즈를 먼저 진행해주세요!</div>;
    }

    const currentId = wrongAnswers[reviewIndex];
    const item = data[currentId];

    return (
        <div className="review-container">
            <h2>오답노트 복습</h2>
            <div className="card review-card">
                <div className="hanja-display" style={{fontFamily: fontSelect}}>{item[0]}</div>
                <div className="info-display">
                    <h3>{item[1]}</h3>
                    <p>{item[2]}</p>
                    <hr />
                    <div style={{fontFamily: fontSelect}}>
                        <strong>관련 단어: </strong>
                        {item[4].map((w, i) => <span key={i} className="tag">{w[0]} </span>)}
                    </div>
                </div>
            </div>
            
            <div className="navigation-btns">
                <button 
                    disabled={reviewIndex === 0} 
                    onClick={() => setReviewIndex(prev => prev - 1)}
                >
                    &lt; 이전
                </button>
                <span>{reviewIndex + 1} / {wrongAnswers.length}</span>
                <button 
                    disabled={reviewIndex === wrongAnswers.length - 1} 
                    onClick={() => setReviewIndex(prev => prev + 1)}
                >
                    다음 &gt;
                </button>
            </div>
        </div>
    );
}

function Settings({ data, fontSelect, setData, setSelected }) {
    const selectList = ["'Rounded Mplus 1c'", "'Noto Sans JP'", "'Noto Serif JP'"];

    const handleSelect = (e) => {
        setSelected(e.target.value);
    };

    const handleChange = (value) => {
        setData(JSON.parse(value));
    };
    
    return (
        <div className="settings-container">
            <select onChange={handleSelect} value={fontSelect}>
            {selectList.map((item) => (
                <option value={item} key={item}>
                {item}
                </option>
            ))}
            </select>
            <textarea 
                className="full-textarea"
                value={JSON.stringify(data)}
                onChange={(e) => handleChange(e.target.value)} 
                rows="100"
            />
        </div>
    )
}

export default App;