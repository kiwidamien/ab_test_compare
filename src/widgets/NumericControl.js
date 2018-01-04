import React  from 'react';

const NumericControl = ({props}) => {
  const { value, name } = props;

  const min = props.min || 0;
  const max = props.max || 100;

  const onInputChange = (e) => { props.onValueChange && props.onValueChange(e.target.value); }

  return (
    <div className="slidecontainer">
      <span>{name}</span>
      <input type="range" min={min} max={max} value={value} className="slider" onChange={onInputChange}/>
      <input value={value} onChange={onInputChange}/>
    </div>
  );
}

export default NumericControl;
