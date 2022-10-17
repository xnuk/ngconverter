#![no_std]

extern crate alloc;

mod convert;
mod hex;
mod keymap;

use crate::convert::from_str;

use alloc::vec::Vec;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn convert(file: &[u8], keymap: &[u8]) -> Vec<u8> {
	from_str(file, keymap).unwrap_or_default()
}
